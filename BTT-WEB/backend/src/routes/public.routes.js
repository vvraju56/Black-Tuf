import { Router } from 'express';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { Service } from '../models/Service.js';
import { SiteSettings } from '../models/SiteSettings.js';
import { ProductNotification } from '../models/ProductNotification.js';
import { ContactMessage } from '../models/ContactMessage.js';
import { SupportRequest } from '../models/SupportRequest.js';
import { asyncHandler, ApiError } from '../utils/ApiError.js';
import { validate } from '../middleware/validate.js';
import {
  contactSchema,
  notifySchema,
  supportSchema,
} from '../validators/schemas.js';
import { contactLimiter, notifyLimiter, supportLimiter } from '../middleware/rateLimit.js';
import { uploadAttachment } from '../middleware/upload.js';
import { cleanText } from '../utils/text.js';
import { uploadBuffer } from '../utils/cloudinary.js';
import { cloudinaryConfigured } from '../config/env.js';
import {
  getCategoriesWithCounts,
  getProductBySlug,
  listProducts,
} from '../services/product.service.js';

const router = Router();

const defaultSettings = {
  companyName: 'BlackTuf Technologies',
  brandName: 'BlackTuf',
  tagline: 'Building Technology That Moves Ideas Forward.',
  description: 'Building modern software products, digital platforms, and technology solutions.',
  supportHandle: '@blacktuftech',
  supportUrl: '',
  socialWebsite: '',
  socialGithub: '',
  socialLinkedin: '',
  business: {
    showBusinessInfo: true,
    enterpriseName: 'BlackTuf Technologies',
    businessType: 'Micro Enterprise',
    majorActivity: 'Services',
    industry: 'Computer Programming / Consultancy Related Activities',
    registrationNote:
      "Official business information is based on the company's Udyam registration.",
  },
};

export function serializeSettings(settings) {
  if (!settings) return defaultSettings;
  return {
    companyName: settings.companyName || defaultSettings.companyName,
    brandName: settings.brandName || defaultSettings.brandName,
    tagline: settings.tagline || defaultSettings.tagline,
    description: settings.description || defaultSettings.description,
    supportHandle: settings.supportHandle || defaultSettings.supportHandle,
    supportUrl: settings.supportUrl || '',
    socialWebsite: settings.socialWebsite || '',
    socialGithub: settings.socialGithub || '',
    socialLinkedin: settings.socialLinkedin || '',
    business: {
      showBusinessInfo: settings.business?.showBusinessInfo ?? true,
      enterpriseName: settings.business?.enterpriseName || defaultSettings.business.enterpriseName,
      businessType: settings.business?.businessType || defaultSettings.business.businessType,
      majorActivity: settings.business?.majorActivity || defaultSettings.business.majorActivity,
      industry: settings.business?.industry || defaultSettings.business.industry,
      registrationNote:
        settings.business?.registrationNote || defaultSettings.business.registrationNote,
    },
  };
}

export async function getPublicSettings() {
  const settings = await SiteSettings.findOne({ key: 'site' }).lean();
  return serializeSettings(settings);
}

router.get(
  '/products',
  asyncHandler(async (req, res) => {
    const {
      search = '',
      category = '',
      status = '',
      featured = '',
      sort = 'featured',
      limit = '',
    } = req.query;

    const allowedStatuses = ['Active', 'Beta', 'Coming Soon', 'Maintenance', 'Archived'];
    const products = await listProducts({
      publishedOnly: true,
      search: String(search).slice(0, 120),
      categorySlug: String(category).slice(0, 80),
      status: allowedStatuses.includes(status) ? status : '',
      featuredOnly: featured === 'true',
      sort: ['featured', 'newest', 'oldest', 'name'].includes(sort) ? sort : 'featured',
      limit: Math.min(Number(limit) || 0, 100),
    });

    res.json({ success: true, data: products, total: products.length });
  })
);

router.get(
  '/products/:slug',
  asyncHandler(async (req, res) => {
    const product = await getProductBySlug(String(req.params.slug).toLowerCase());
    if (!product) throw new ApiError(404, 'Product not found.');
    res.json({ success: true, data: product });
  })
);

router.post(
  '/products/:slug/notify',
  notifyLimiter,
  validate(notifySchema),
  asyncHandler(async (req, res) => {
    const product = await Product.findOne({
      slug: String(req.params.slug).toLowerCase(),
      published: true,
    }).lean();
    if (!product) throw new ApiError(404, 'Product not found.');

    try {
      await ProductNotification.create({ product: product._id, email: req.body.email });
    } catch (error) {
      // Duplicate signup is idempotent and intentionally not disclosed.
      if (error.code !== 11000) throw error;
    }

    res.status(201).json({
      success: true,
      message: "You're on the list. We'll email you when this product launches.",
    });
  })
);

router.get(
  '/categories',
  asyncHandler(async (_req, res) => {
    const categories = await getCategoriesWithCounts(true);
    res.json({ success: true, data: categories });
  })
);

router.get(
  '/services',
  asyncHandler(async (_req, res) => {
    const services = await Service.find({ published: true })
      .sort({ order: 1, createdAt: 1 })
      .lean();
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
      })),
    });
  })
);

router.get(
  '/settings',
  asyncHandler(async (_req, res) => {
    res.json({ success: true, data: await getPublicSettings() });
  })
);

router.post(
  '/contact',
  contactLimiter,
  validate(contactSchema),
  asyncHandler(async (req, res) => {
    const { name, email, company, subject, message, productName, projectType, budget } = req.body;
    await ContactMessage.create({
      name: cleanText(name, 120),
      email: cleanText(email, 254).toLowerCase(),
      company: cleanText(company, 160),
      subject: cleanText(subject, 200),
      message: cleanText(message, 5000),
      productName: cleanText(productName, 120),
      projectType: cleanText(projectType, 120),
      budget: cleanText(budget, 80),
    });

    res.status(201).json({
      success: true,
      message: "Thanks for reaching out. We'll get back to you as soon as we can.",
    });
  })
);

router.post(
  '/support',
  supportLimiter,
  uploadAttachment.single('attachment'),
  validate(supportSchema),
  asyncHandler(async (req, res) => {
    let attachmentUrl = '';
    let attachmentName = '';

    if (req.file) {
      if (!cloudinaryConfigured) {
        throw new ApiError(
          503,
          'Attachments are temporarily unavailable. Please submit the form without a file.'
        );
      }
      const uploaded = await uploadBuffer(req.file.buffer, {
        folder: 'blacktuf/support',
        resourceType: 'auto',
      });
      attachmentUrl = uploaded.url;
      attachmentName = cleanText(req.file.originalname, 200);
    }

    const { name, email, productName, issueType, message } = req.body;
    await SupportRequest.create({
      name: cleanText(name, 120),
      email: cleanText(email, 254).toLowerCase(),
      productName: cleanText(productName, 120),
      issueType,
      message: cleanText(message, 5000),
      attachmentUrl,
      attachmentName,
    });

    res.status(201).json({
      success: true,
      message: "Your request has been received. We'll follow up by email.",
    });
  })
);

export default router;
