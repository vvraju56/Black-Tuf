import { z } from 'zod';

export const objectId = z
  .string()
  .trim()
  .regex(/^[a-f0-9]{24}$/i, 'Invalid identifier.');

const urlOrEmpty = (label) =>
  z
    .string()
    .trim()
    .max(500)
    .refine(
      (value) => {
        if (!value) return true;
        try {
          const url = new URL(value);
          return url.protocol === 'http:' || url.protocol === 'https:';
        } catch {
          return false;
        }
      },
      { message: `${label} must be a valid http(s) URL.` }
    )
    .default('');

const assetOrEmpty = (label) =>
  z
    .string()
    .trim()
    .max(1000)
    .refine(
      (value) => {
        if (!value) return true;
        if (value.startsWith('/')) return true;
        try {
          const url = new URL(value);
          return url.protocol === 'http:' || url.protocol === 'https:';
        } catch {
          return false;
        }
      },
      { message: `${label} must be a valid URL or an absolute site path.` }
    )
    .default('');

const dateOrEmpty = z
  .string()
  .trim()
  .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), {
    message: 'Use a valid date (YYYY-MM-DD).',
  })
  .default('');

const slugField = z
  .string()
  .trim()
  .max(80)
  .refine((value) => !value || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value), {
    message: 'Use lowercase letters, numbers, and single hyphens.',
  })
  .default('');

const featureSchema = z.object({
  icon: z.string().trim().max(40).default('Sparkles'),
  title: z.string().trim().min(1, 'Feature title is required.').max(120),
  description: z.string().trim().max(600).default(''),
});

const screenshotSchema = z.object({
  url: z.string().trim().min(1, 'Screenshot URL is required.').max(1000),
  alt: z.string().trim().max(200).default(''),
  caption: z.string().trim().max(200).default(''),
});

const faqSchema = z.object({
  question: z.string().trim().min(1, 'Question is required.').max(300),
  answer: z.string().trim().min(1, 'Answer is required.').max(3000),
});

const changelogSchema = z.object({
  version: z.string().trim().min(1, 'Version is required.').max(40),
  releaseDate: dateOrEmpty,
  notes: z.array(z.string().trim().max(500)).max(30).default([]),
});

const stepSchema = z.object({
  title: z.string().trim().min(1, 'Step title is required.').max(120),
  description: z.string().trim().max(500).default(''),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, 'Product name is required.').max(120),
  slug: slugField,
  shortDescription: z
    .string()
    .trim()
    .min(10, 'Add a short description of at least 10 characters.')
    .max(320),
  description: z.string().trim().max(20000).default(''),
  logoUrl: assetOrEmpty('Logo URL'),
  bannerUrl: assetOrEmpty('Banner URL'),
  category: objectId,
  status: z.enum(['Active', 'Beta', 'Coming Soon', 'Maintenance', 'Archived']),
  websiteUrl: urlOrEmpty('Website URL'),
  githubUrl: urlOrEmpty('GitHub URL'),
  documentationUrl: urlOrEmpty('Documentation URL'),
  supportUrl: urlOrEmpty('Support URL'),
  version: z.string().trim().max(40).default(''),
  releaseDate: dateOrEmpty,
  pricingType: z.enum(['', 'Free', 'Freemium', 'Paid', 'Custom', 'Coming Soon']).default(''),
  pricingNote: z.string().trim().max(500).default(''),
  howItWorks: z.array(stepSchema).max(10).default([]),
  features: z.array(featureSchema).max(24).default([]),
  screenshots: z.array(screenshotSchema).max(24).default([]),
  technologies: z.array(z.string().trim().min(1).max(60)).max(30).default([]),
  faqs: z.array(faqSchema).max(20).default([]),
  changelog: z.array(changelogSchema).max(40).default([]),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  order: z.coerce.number().int().min(0).max(9999).default(0),
  seoTitle: z.string().trim().max(70).default(''),
  seoDescription: z.string().trim().max(180).default(''),
});

export const productFlagsSchema = z
  .object({
    published: z.boolean().optional(),
    featured: z.boolean().optional(),
    status: z.enum(['Active', 'Beta', 'Coming Soon', 'Maintenance', 'Archived']).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one field to update.',
  });

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'Category name is required.').max(80),
  slug: slugField,
  description: z.string().trim().max(300).default(''),
  order: z.coerce.number().int().min(0).max(9999).default(0),
});

export const serviceSchema = z.object({
  title: z.string().trim().min(2, 'Service title is required.').max(120),
  slug: slugField,
  shortDescription: z.string().trim().min(10, 'Add a short description.').max(320),
  description: z.string().trim().max(8000).default(''),
  icon: z.string().trim().max(40).default('Code2'),
  features: z.array(z.string().trim().max(200)).max(12).default([]),
  order: z.coerce.number().int().min(0).max(9999).default(0),
  published: z.boolean().default(true),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(120),
  email: z.string().trim().email('Please enter a valid email address.').max(254),
  company: z.string().trim().max(160).default(''),
  subject: z.string().trim().min(3, 'Please add a subject.').max(200),
  message: z
    .string()
    .trim()
    .min(10, 'Please add a little more detail (at least 10 characters).')
    .max(5000),
  productName: z.string().trim().max(120).default(''),
  projectType: z.string().trim().max(120).default(''),
  budget: z.string().trim().max(80).default(''),
  website: z.string().max(0, 'Spam detected.').default(''),
});

export const supportSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(120),
  email: z.string().trim().email('Please enter a valid email address.').max(254),
  productName: z.string().trim().max(120).default(''),
  issueType: z
    .enum(['Product Support', 'Bug Report', 'Feature Request', 'Account Help', 'Documentation', 'General'])
    .default('General'),
  message: z
    .string()
    .trim()
    .min(10, 'Please describe the issue (at least 10 characters).')
    .max(5000),
  website: z.string().max(0, 'Spam detected.').default(''),
});

export const notifySchema = z.object({
  email: z.string().trim().email('Please enter a valid email address.').max(254),
  website: z.string().max(0, 'Spam detected.').default(''),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.').max(254),
  password: z.string().min(1, 'Enter your password.').max(200),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password.').max(200),
  newPassword: z
    .string()
    .min(10, 'Use at least 10 characters for the new password.')
    .max(200)
    .regex(/[a-zA-Z]/, 'Include at least one letter.')
    .regex(/[0-9]/, 'Include at least one number.'),
});

export const settingsSchema = z.object({
  companyName: z.string().trim().min(2).max(120),
  brandName: z.string().trim().min(1).max(60),
  tagline: z.string().trim().max(200).default(''),
  description: z.string().trim().max(400).default(''),
  supportHandle: z.string().trim().min(1).max(80),
  supportUrl: urlOrEmpty('Support URL'),
  socialWebsite: urlOrEmpty('Website URL'),
  socialGithub: urlOrEmpty('GitHub URL'),
  socialLinkedin: urlOrEmpty('LinkedIn URL'),
  business: z.object({
    showBusinessInfo: z.boolean().default(true),
    enterpriseName: z.string().trim().max(160).default(''),
    businessType: z.string().trim().max(80).default(''),
    majorActivity: z.string().trim().max(80).default(''),
    industry: z.string().trim().max(200).default(''),
    registrationNote: z.string().trim().max(300).default(''),
  }),
});

export const messageStatusSchema = z.object({
  status: z.enum(['new', 'read', 'replied', 'archived']),
});

export const supportStatusSchema = z.object({
  status: z.enum(['new', 'in_progress', 'resolved', 'archived']),
});
