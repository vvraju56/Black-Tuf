export type ProductStatus = 'Active' | 'Beta' | 'Coming Soon' | 'Maintenance' | 'Archived';

export type PricingType = 'Free' | 'Freemium' | 'Paid' | 'Custom' | 'Coming Soon';

export interface ProductFeature {
  id: string;
  icon: string;
  title: string;
  description: string;
  order: number;
}

export interface ProductScreenshot {
  id: string;
  url: string;
  alt: string;
  caption: string;
  order: number;
}

export interface ProductTechnology {
  id: string;
  name: string;
  order: number;
}

export interface ProductFaq {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface ProductChangelogEntry {
  id: string;
  version: string;
  releaseDate: string;
  notes: string[];
  order: number;
}

export interface ProductStep {
  title: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  logo: string;
  bannerImage: string;
  category: { id: string; name: string; slug: string } | null;
  categoryName: string;
  status: ProductStatus;
  websiteUrl: string;
  githubUrl: string;
  documentationUrl: string;
  supportUrl: string;
  version: string;
  releaseDate: string;
  pricing: { type: PricingType; note: string } | null;
  howItWorks: ProductStep[];
  featured: boolean;
  published: boolean;
  order: number;
  seoTitle: string;
  seoDescription: string;
  features: ProductFeature[];
  screenshots: ProductScreenshot[];
  technologies: ProductTechnology[];
  faqs: ProductFaq[];
  changelog: ProductChangelogEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  order: number;
  productCount: number;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  icon: string;
  features: string[];
  order: number;
  published?: boolean;
}

export interface BusinessInfo {
  showBusinessInfo: boolean;
  enterpriseName: string;
  businessType: string;
  majorActivity: string;
  industry: string;
  registrationNote: string;
}

export interface SiteSettings {
  companyName: string;
  brandName: string;
  tagline: string;
  description: string;
  supportHandle: string;
  supportUrl: string;
  socialWebsite: string;
  socialGithub: string;
  socialLinkedin: string;
  business: BusinessInfo;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin';
  lastLoginAt: string | null;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
  productName: string;
  projectType: string;
  budget: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: string;
}

export interface SupportRequest {
  id: string;
  name: string;
  email: string;
  productName: string;
  issueType: string;
  message: string;
  attachmentUrl: string;
  attachmentName: string;
  status: 'new' | 'in_progress' | 'resolved' | 'archived';
  createdAt: string;
}

export interface ProductNotificationItem {
  id: string;
  email: string;
  productName: string;
  productSlug: string;
  createdAt: string;
}

export interface AdminStats {
  products: number;
  published: number;
  featured: number;
  services: number;
  messages: number;
  newMessages: number;
  supportRequests: number;
  openSupport: number;
  notifications: number;
}

export interface AdminCategory extends Category {
  productCount: number;
}

export interface ApiErrorShape {
  message: string;
  errors?: { field: string; message: string }[];
}

export interface ProductUpdate {
  id: string;
  productName: string;
  productSlug: string;
  version: string;
  releaseDate: string;
  notes: string[];
  createdAt: string;
  isChangelog: boolean;
}
