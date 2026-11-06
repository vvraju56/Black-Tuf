import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { ProductFeature } from '../models/ProductFeature.js';
import { ProductScreenshot } from '../models/ProductScreenshot.js';
import { ProductTechnology } from '../models/ProductTechnology.js';
import { ProductFaq } from '../models/ProductFaq.js';
import { ProductChangelog } from '../models/ProductChangelog.js';
import { ProductNotification } from '../models/ProductNotification.js';
import { ApiError } from '../utils/ApiError.js';
import { cleanMultiline, cleanText, cleanUrl } from '../utils/text.js';

const childModels = [
  ProductFeature,
  ProductScreenshot,
  ProductTechnology,
  ProductFaq,
  ProductChangelog,
];

function mapFeature(feature) {
  return {
    id: String(feature._id),
    icon: feature.icon || 'Sparkles',
    title: feature.title,
    description: feature.description || '',
    order: feature.order || 0,
  };
}

function mapScreenshot(item) {
  return {
    id: String(item._id),
    url: item.url,
    alt: item.alt || '',
    caption: item.caption || '',
    order: item.order || 0,
  };
}

function mapTechnology(item) {
  return { id: String(item._id), name: item.name, order: item.order || 0 };
}

function mapFaq(item) {
  return { id: String(item._id), question: item.question, answer: item.answer, order: item.order || 0 };
}

function mapChangelog(item) {
  return {
    id: String(item._id),
    version: item.version,
    releaseDate: item.releaseDate ? item.releaseDate.toISOString().slice(0, 10) : '',
    notes: item.notes || [],
    order: item.order || 0,
  };
}

export function serializeProduct(product, related = {}, category = null) {
  const plain = product.toObject ? product.toObject() : product;
  const categoryDoc = category || (plain.category && plain.category.name ? plain.category : null);

  return {
    id: String(plain._id),
    name: plain.name,
    slug: plain.slug,
    shortDescription: plain.shortDescription,
    description: plain.description || '',
    logo: plain.logoUrl || '',
    bannerImage: plain.bannerUrl || '',
    category: categoryDoc
      ? { id: String(categoryDoc._id || categoryDoc.id), name: categoryDoc.name, slug: categoryDoc.slug }
      : null,
    categoryName: categoryDoc?.name || 'Other',
    status: plain.status,
    websiteUrl: plain.websiteUrl || '',
    githubUrl: plain.githubUrl || '',
    documentationUrl: plain.documentationUrl || '',
    supportUrl: plain.supportUrl || '',
    version: plain.version || '',
    releaseDate: plain.releaseDate ? plain.releaseDate.toISOString().slice(0, 10) : '',
    pricing: plain.pricingType
      ? { type: plain.pricingType, note: plain.pricingNote || '' }
      : null,
    howItWorks: (plain.howItWorks || []).map((step) => ({
      title: step.title,
      description: step.description || '',
    })),
    featured: Boolean(plain.featured),
    published: Boolean(plain.published),
    order: plain.order || 0,
    seoTitle: plain.seoTitle || '',
    seoDescription: plain.seoDescription || '',
    features: (related.features || []).map(mapFeature),
    screenshots: (related.screenshots || []).map(mapScreenshot),
    technologies: (related.technologies || []).map(mapTechnology),
    faqs: (related.faqs || []).map(mapFaq),
    changelog: (related.changelog || []).map(mapChangelog),
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
  };
}

async function hydrate(products) {
  if (!products.length) return [];
  const ids = products.map((product) => product._id);
  const [categories, features, screenshots, technologies, faqs, changelog] = await Promise.all([
    Category.find({ _id: { $in: products.map((p) => p.category).filter(Boolean) } }).lean(),
    ProductFeature.find({ product: { $in: ids } }).sort({ order: 1, createdAt: 1 }).lean(),
    ProductScreenshot.find({ product: { $in: ids } }).sort({ order: 1, createdAt: 1 }).lean(),
    ProductTechnology.find({ product: { $in: ids } }).sort({ order: 1, createdAt: 1 }).lean(),
    ProductFaq.find({ product: { $in: ids } }).sort({ order: 1, createdAt: 1 }).lean(),
    ProductChangelog.find({ product: { $in: ids } }).sort({ order: 1, createdAt: 1 }).lean(),
  ]);

  const categoryMap = new Map(categories.map((category) => [String(category._id), category]));
  const group = (items) => {
    const map = new Map();
    for (const item of items) {
      const key = String(item.product);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    }
    return map;
  };

  const featureMap = group(features);
  const screenshotMap = group(screenshots);
  const technologyMap = group(technologies);
  const faqMap = group(faqs);
  const changelogMap = group(changelog);

  return products.map((product) => {
    const key = String(product._id);
    const category = categoryMap.get(String(product.category));
    return serializeProduct(
      product,
      {
        features: featureMap.get(key),
        screenshots: screenshotMap.get(key),
        technologies: technologyMap.get(key),
        faqs: faqMap.get(key),
        changelog: changelogMap.get(key),
      },
      category
    );
  });
}

function matchesSearch(product, search) {
  const haystack = [
    product.name,
    product.shortDescription,
    product.description,
    product.categoryName,
    product.status,
    product.version,
    ...product.technologies.map((tech) => tech.name),
    ...product.features.flatMap((feature) => [feature.title, feature.description]),
    ...product.faqs.flatMap((faq) => [faq.question, faq.answer]),
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(search.toLowerCase());
}

export async function listProducts(options = {}) {
  const {
    publishedOnly = true,
    search = '',
    categorySlug = '',
    status = '',
    featuredOnly = false,
    sort = 'featured',
    limit = 0,
    includeChildren = true,
  } = options;

  const filter = {};
  if (publishedOnly) filter.published = true;
  if (status) filter.status = status;
  if (featuredOnly) filter.featured = true;

  if (categorySlug) {
    const category = await Category.findOne({ slug: categorySlug }).lean();
    if (!category) return [];
    filter.category = category._id;
  }

  let query = Product.find(filter);
  if (sort === 'newest') query = query.sort({ createdAt: -1 });
  else if (sort === 'oldest') query = query.sort({ createdAt: 1 });
  else if (sort === 'name') query = query.sort({ name: 1 });
  else query = query.sort({ featured: -1, order: 1, createdAt: -1 });

  const products = await query.lean();
  if (!includeChildren) {
    return products.map((product) => serializeProduct(product));
  }

  let hydrated = await hydrate(products);
  if (search) hydrated = hydrated.filter((product) => matchesSearch(product, search));
  if (limit > 0) hydrated = hydrated.slice(0, limit);
  return hydrated;
}

export async function getProductBySlug(slug, publishedOnly = true) {
  const filter = { slug };
  if (publishedOnly) filter.published = true;
  const product = await Product.findOne(filter);
  if (!product) return null;
  const [hydrated] = await hydrate([product.toObject()]);
  return hydrated || null;
}

export async function getProductById(id) {
  const product = await Product.findById(id).lean();
  if (!product) return null;
  const [hydrated] = await hydrate([product]);
  return hydrated || null;
}

export async function getCategoriesWithCounts(publishedOnly = true) {
  const categories = await Category.find().sort({ order: 1, name: 1 }).lean();
  const match = publishedOnly ? { published: true } : {};
  const counts = await Product.aggregate([
    { $match: match },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((item) => [String(item._id), item.count]));

  return categories
    .map((category) => ({
      id: String(category._id),
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      order: category.order || 0,
      productCount: countMap.get(String(category._id)) || 0,
    }))
    .filter((category) => !publishedOnly || category.productCount > 0);
}

async function replaceChildren(productId, data) {
  await Promise.all(childModels.map((model) => model.deleteMany({ product: productId })));

  const features = (data.features || []).map((feature, index) => ({
    product: productId,
    icon: cleanText(feature.icon, 40) || 'Sparkles',
    title: cleanText(feature.title, 120),
    description: cleanText(feature.description, 600),
    order: index,
  }));

  const screenshots = (data.screenshots || []).map((item, index) => ({
    product: productId,
    url: cleanUrl(item.url),
    alt: cleanText(item.alt, 200),
    caption: cleanText(item.caption, 200),
    order: index,
  }));

  const seen = new Set();
  const technologies = [];
  for (const [index, raw] of (data.technologies || []).entries()) {
    const name = cleanText(raw, 60);
    const key = name.toLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);
    technologies.push({ product: productId, name, order: index });
  }

  const faqs = (data.faqs || []).map((faq, index) => ({
    product: productId,
    question: cleanText(faq.question, 300),
    answer: cleanText(faq.answer, 3000),
    order: index,
  }));

  const changelog = (data.changelog || []).map((entry, index) => ({
    product: productId,
    version: cleanText(entry.version, 40),
    releaseDate: entry.releaseDate ? new Date(`${entry.releaseDate}T00:00:00.000Z`) : undefined,
    notes: (entry.notes || []).map((note) => cleanText(note, 500)).filter(Boolean),
    order: index,
  }));

  await Promise.all([
    features.length ? ProductFeature.insertMany(features) : null,
    screenshots.length ? ProductScreenshot.insertMany(screenshots) : null,
    technologies.length ? ProductTechnology.insertMany(technologies) : null,
    faqs.length ? ProductFaq.insertMany(faqs) : null,
    changelog.length ? ProductChangelog.insertMany(changelog) : null,
  ]);
}

function toProductFields(data) {
  return {
    name: cleanText(data.name, 120),
    shortDescription: cleanText(data.shortDescription, 320),
    description: cleanMultiline(data.description, 20000),
    logoUrl: cleanUrl(data.logoUrl),
    bannerUrl: cleanUrl(data.bannerUrl),
    category: data.category,
    status: data.status,
    websiteUrl: cleanUrl(data.websiteUrl),
    githubUrl: cleanUrl(data.githubUrl),
    documentationUrl: cleanUrl(data.documentationUrl),
    supportUrl: cleanUrl(data.supportUrl),
    version: cleanText(data.version, 40),
    releaseDate: data.releaseDate ? new Date(`${data.releaseDate}T00:00:00.000Z`) : undefined,
    pricingType: data.pricingType || '',
    pricingNote: cleanText(data.pricingNote, 500),
    howItWorks: (data.howItWorks || []).map((step) => ({
      title: cleanText(step.title, 120),
      description: cleanText(step.description, 500),
    })),
    featured: Boolean(data.featured),
    published: Boolean(data.published),
    order: Number(data.order) || 0,
    seoTitle: cleanText(data.seoTitle, 70),
    seoDescription: cleanText(data.seoDescription, 180),
  };
}

export async function createProduct(data, slug) {
  const category = await Category.findById(data.category);
  if (!category) throw new ApiError(422, 'Choose a valid category.');

  const product = await Product.create({ ...toProductFields(data), slug });
  await replaceChildren(product._id, data);
  return getProductById(product._id);
}

export async function updateProduct(id, data, slug) {
  const existing = await Product.findById(id);
  if (!existing) throw new ApiError(404, 'Product not found.');

  const category = await Category.findById(data.category);
  if (!category) throw new ApiError(422, 'Choose a valid category.');

  await Product.findByIdAndUpdate(id, { ...toProductFields(data), slug }, { runValidators: true });
  await replaceChildren(existing._id, data);
  return getProductById(id);
}

export async function deleteProduct(id) {
  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, 'Product not found.');
  await Promise.all([
    ...childModels.map((model) => model.deleteMany({ product: product._id })),
    ProductNotification.deleteMany({ product: product._id }),
  ]);
  await product.deleteOne();
}

export { replaceChildren };
