import { Router } from 'express';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { Service } from '../models/Service.js';
import { SiteSettings } from '../models/SiteSettings.js';
import { ContactMessage } from '../models/ContactMessage.js';
import { SupportRequest } from '../models/SupportRequest.js';
import { ProductNotification } from '../models/ProductNotification.js';
import { asyncHandler, ApiError } from '../utils/ApiError.js';
import { validate } from '../middleware/validate.js';
import {
  categorySchema,
  messageStatusSchema,
  productFlagsSchema,
  productSchema,
  serviceSchema,
  settingsSchema,
  supportStatusSchema,
} from '../validators/schemas.js';
import { uploadImage } from '../middleware/upload.js';
import { uploadLimiter } from '../middleware/rateLimit.js';
import { uploadBuffer } from '../utils/cloudinary.js';
import { cleanText, cleanUrl } from '../utils/text.js';
import { uniqueSlug } from '../utils/slug.js';
import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct,
} from '../services/product.service.js';
import { serializeSettings } from './public.routes.js';

const router = Router();

router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const [
      products,
      published,
      featured,
      services,
      messages,
      newMessages,
      supportRequests,
      openSupport,
      notifications,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ published: true }),
      Product.countDocuments({ featured: true, published: true }),
      Service.countDocuments(),
      ContactMessage.countDocuments(),
      ContactMessage.countDocuments({ status: 'new' }),
      SupportRequest.countDocuments(),
      SupportRequest.countDocuments({ status: 'new' }),
      ProductNotification.countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        products,
        published,
        featured,
        services,
        messages,
        newMessages,
        supportRequests,
        openSupport,
        notifications,
      },
    });
  })
);

// ── Products ────────────────────────────────────────────────────────────
router.get(
  '/products',
  asyncHandler(async (_req, res) => {
    const products = await listProducts({ publishedOnly: false, sort: 'newest' });
    res.json({ success: true, data: products, total: products.length });
  })
);

router.get(
  '/products/:id',
  asyncHandler(async (req, res) => {
    const product = await getProductById(req.params.id);
    if (!product) throw new ApiError(404, 'Product not found.');
    res.json({ success: true, data: product });
  })
);

router.post(
  '/products',
  validate(productSchema),
  asyncHandler(async (req, res) => {
    const desired = req.body.slug || req.body.name;
    const slug = await uniqueSlug(Product, desired);
    const product = await createProduct(req.body, slug);
    res.status(201).json({ success: true, data: product });
  })
);

router.put(
  '/products/:id',
  validate(productSchema),
  asyncHandler(async (req, res) => {
    const desired = req.body.slug || req.body.name;
    const slug = await uniqueSlug(Product, desired, req.params.id);
    const product = await updateProduct(req.params.id, req.body, slug);
    res.json({ success: true, data: product });
  })
);

router.patch(
  '/products/:id/flags',
  validate(productFlagsSchema),
  asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) throw new ApiError(404, 'Product not found.');
    res.json({
      success: true,
      data: {
        id: String(product._id),
        published: product.published,
        featured: product.featured,
        status: product.status,
      },
    });
  })
);

router.delete(
  '/products/:id',
  asyncHandler(async (req, res) => {
    await deleteProduct(req.params.id);
    res.json({ success: true, message: 'Product deleted.' });
  })
);

// ── Categories ──────────────────────────────────────────────────────────
router.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    const categories = await Category.find().sort({ order: 1, name: 1 }).lean();
    const counts = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((item) => [String(item._id), item.count]));

    res.json({
      success: true,
      data: categories.map((category) => ({
        id: String(category._id),
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        order: category.order || 0,
        productCount: countMap.get(String(category._id)) || 0,
      })),
    });
  })
);

router.post(
  '/categories',
  validate(categorySchema),
  asyncHandler(async (req, res) => {
    const slug = await uniqueSlug(Category, req.body.slug || req.body.name);
    const category = await Category.create({
      name: cleanText(req.body.name, 80),
      slug,
      description: cleanText(req.body.description, 300),
      order: Number(req.body.order) || 0,
    });
    res.status(201).json({
      success: true,
      data: {
        id: String(category._id),
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        order: category.order || 0,
        productCount: 0,
      },
    });
  })
);

router.put(
  '/categories/:id',
  validate(categorySchema),
  asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) throw new ApiError(404, 'Category not found.');
    const slug = await uniqueSlug(Category, req.body.slug || req.body.name, category._id);
    category.name = cleanText(req.body.name, 80);
    category.slug = slug;
    category.description = cleanText(req.body.description, 300);
    category.order = Number(req.body.order) || 0;
    await category.save();
    res.json({ success: true, data: { id: String(category._id), ...category.toObject() } });
  })
);

router.delete(
  '/categories/:id',
  asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) throw new ApiError(404, 'Category not found.');
    const productCount = await Product.countDocuments({ category: category._id });
    if (productCount > 0) {
      throw new ApiError(
        409,
        `This category is used by ${productCount} product${productCount === 1 ? '' : 's'}. Move them first.`
      );
    }
    await category.deleteOne();
    res.json({ success: true, message: 'Category deleted.' });
  })
);

// ── Services ────────────────────────────────────────────────────────────
router.get(
  '/services',
  asyncHandler(async (_req, res) => {
    const services = await Service.find().sort({ order: 1, createdAt: 1 }).lean();
    res.json({
      success: true,
      data: services.map((service) => ({
        id: String(service._id),
        title: service.title,
        slug: service.slug,
        shortDescription: service.shortDescription,
        description: service.description || '',
        icon: service.icon || 'Code2',
        features: service.features || [],
        order: service.order || 0,
        published: service.published,
      })),
    });
  })
);

router.post(
  '/services',
  validate(serviceSchema),
  asyncHandler(async (req, res) => {
    const slug = await uniqueSlug(Service, req.body.slug || req.body.title);
    const service = await Service.create({
      title: cleanText(req.body.title, 120),
      slug,
      shortDescription: cleanText(req.body.shortDescription, 320),
      description: cleanText(req.body.description, 8000),
      icon: cleanText(req.body.icon, 40) || 'Code2',
      features: req.body.features.map((feature) => cleanText(feature, 200)).filter(Boolean),
      order: Number(req.body.order) || 0,
      published: Boolean(req.body.published),
    });
    res.status(201).json({ success: true, data: { id: String(service._id), ...service.toObject() } });
  })
);

router.put(
  '/services/:id',
  validate(serviceSchema),
  asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);
    if (!service) throw new ApiError(404, 'Service not found.');
    const slug = await uniqueSlug(Service, req.body.slug || req.body.title, service._id);
    service.title = cleanText(req.body.title, 120);
    service.slug = slug;
    service.shortDescription = cleanText(req.body.shortDescription, 320);
    service.description = cleanText(req.body.description, 8000);
    service.icon = cleanText(req.body.icon, 40) || 'Code2';
    service.features = req.body.features.map((feature) => cleanText(feature, 200)).filter(Boolean);
    service.order = Number(req.body.order) || 0;
    service.published = Boolean(req.body.published);
    await service.save();
    res.json({ success: true, data: { id: String(service._id), ...service.toObject() } });
  })
);

router.delete(
  '/services/:id',
  asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);
    if (!service) throw new ApiError(404, 'Service not found.');
    await service.deleteOne();
    res.json({ success: true, message: 'Service deleted.' });
  })
);

// ── Messages ────────────────────────────────────────────────────────────
router.get(
  '/messages',
  asyncHandler(async (req, res) => {
    const filter = {};
    if (['new', 'read', 'replied', 'archived'].includes(req.query.status)) {
      filter.status = req.query.status;
    }
    const messages = await ContactMessage.find(filter).sort({ createdAt: -1 }).limit(300).lean();
    res.json({
      success: true,
      data: messages.map((message) => ({
        id: String(message._id),
        name: message.name,
        email: message.email,
        company: message.company || '',
        subject: message.subject,
        message: message.message,
        productName: message.productName || '',
        projectType: message.projectType || '',
        budget: message.budget || '',
        status: message.status,
        createdAt: message.createdAt,
      })),
    });
  })
);

router.patch(
  '/messages/:id',
  validate(messageStatusSchema),
  asyncHandler(async (req, res) => {
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!message) throw new ApiError(404, 'Message not found.');
    res.json({ success: true, data: { id: String(message._id), status: message.status } });
  })
);

router.delete(
  '/messages/:id',
  asyncHandler(async (req, res) => {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!message) throw new ApiError(404, 'Message not found.');
    res.json({ success: true, message: 'Message deleted.' });
  })
);

// ── Support requests ────────────────────────────────────────────────────
router.get(
  '/support-requests',
  asyncHandler(async (req, res) => {
    const filter = {};
    if (['new', 'in_progress', 'resolved', 'archived'].includes(req.query.status)) {
      filter.status = req.query.status;
    }
    const requests = await SupportRequest.find(filter).sort({ createdAt: -1 }).limit(300).lean();
    res.json({
      success: true,
      data: requests.map((request) => ({
        id: String(request._id),
        name: request.name,
        email: request.email,
        productName: request.productName || '',
        issueType: request.issueType,
        message: request.message,
        attachmentUrl: request.attachmentUrl || '',
        attachmentName: request.attachmentName || '',
        status: request.status,
        createdAt: request.createdAt,
      })),
    });
  })
);

router.patch(
  '/support-requests/:id',
  validate(supportStatusSchema),
  asyncHandler(async (req, res) => {
    const request = await SupportRequest.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!request) throw new ApiError(404, 'Support request not found.');
    res.json({ success: true, data: { id: String(request._id), status: request.status } });
  })
);

router.delete(
  '/support-requests/:id',
  asyncHandler(async (req, res) => {
    const request = await SupportRequest.findByIdAndDelete(req.params.id);
    if (!request) throw new ApiError(404, 'Support request not found.');
    res.json({ success: true, message: 'Support request deleted.' });
  })
);

// ── Settings ────────────────────────────────────────────────────────────
router.get(
  '/settings',
  asyncHandler(async (_req, res) => {
    const settings = await SiteSettings.findOne({ key: 'site' }).lean();
    res.json({ success: true, data: serializeSettings(settings) });
  })
);

router.put(
  '/settings',
  validate(settingsSchema),
  asyncHandler(async (req, res) => {
    const data = req.body;
    const update = {
      companyName: cleanText(data.companyName, 120),
      brandName: cleanText(data.brandName, 60),
      tagline: cleanText(data.tagline, 200),
      description: cleanText(data.description, 400),
      supportHandle: cleanText(data.supportHandle, 80),
      supportUrl: cleanUrl(data.supportUrl),
      socialWebsite: cleanUrl(data.socialWebsite),
      socialGithub: cleanUrl(data.socialGithub),
      socialLinkedin: cleanUrl(data.socialLinkedin),
      business: {
        showBusinessInfo: Boolean(data.business.showBusinessInfo),
        enterpriseName: cleanText(data.business.enterpriseName, 160),
        businessType: cleanText(data.business.businessType, 80),
        majorActivity: cleanText(data.business.majorActivity, 80),
        industry: cleanText(data.business.industry, 200),
        registrationNote: cleanText(data.business.registrationNote, 300),
      },
    };

    const settings = await SiteSettings.findOneAndUpdate(
      { key: 'site' },
      { $set: update, $setOnInsert: { key: 'site' } },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    res.json({ success: true, data: serializeSettings(settings) });
  })
);

// ── Uploads ─────────────────────────────────────────────────────────────
router.post(
  '/upload',
  uploadLimiter,
  uploadImage.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, 'Choose an image to upload.');
    const kind = ['logo', 'banner', 'screenshot'].includes(req.query.kind)
      ? req.query.kind
      : 'logo';
    const uploaded = await uploadBuffer(req.file.buffer, {
      folder: `blacktuf/products/${kind}s`,
      resourceType: 'image',
    });
    res.status(201).json({ success: true, data: uploaded });
  })
);

// ── Launch notifications (read-only) ────────────────────────────────────
router.get(
  '/notifications',
  asyncHandler(async (_req, res) => {
    const notifications = await ProductNotification.find()
      .sort({ createdAt: -1 })
      .limit(500)
      .populate('product', 'name slug')
      .lean();
    res.json({
      success: true,
      data: notifications.map((item) => ({
        id: String(item._id),
        email: item.email,
        productName: item.product?.name || 'Deleted product',
        productSlug: item.product?.slug || '',
        createdAt: item.createdAt,
      })),
    });
  })
);

export default router;
