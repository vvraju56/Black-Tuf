import type { SiteSettings } from './types';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(
  /\/$/,
  ''
);

export const SITE_NAME = 'BlackTuf Technologies';
export const SITE_SHORT_NAME = 'BlackTuf';
export const SITE_DESCRIPTION =
  'BlackTuf Technologies builds modern software products, digital platforms, developer tools, and technology solutions.';

export const SUPPORT_HANDLE =
  process.env.NEXT_PUBLIC_SUPPORT_HANDLE || '@blacktuftech';

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Docs', href: '/docs' },
  { label: 'Support', href: '/support' },
  { label: 'Contact', href: '/contact' },
] as const;

export const FOOTER_LINKS = {
  features: [
    { label: 'Technology', href: '/services' },
    { label: 'Developer Tools', href: '/products?category=developer-tools' },
    { label: 'AI', href: '/products?category=ai' },
    { label: 'Automation', href: '/services#ai-automation' },
    { label: 'Platforms', href: '/services' },
  ],
  resources: [
    { label: 'Documentation', href: '/docs' },
    { label: 'Guides', href: '/docs/getting-started' },
    { label: 'Changelog', href: '/docs/changelog' },
    { label: 'About', href: '/about' },
  ],
  support: [
    { label: 'Support Center', href: '/support' },
    { label: 'Contact', href: '/contact' },
    { label: 'Report an Issue', href: '/support?issue=bug' },
  ],
  legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Cookies', href: '/cookies' },
  ],
} as const;

export const DEFAULT_SETTINGS: SiteSettings = {
  companyName: SITE_NAME,
  brandName: SITE_SHORT_NAME,
  tagline: 'Building Technology That Moves Ideas Forward.',
  description: 'Building modern software products, digital platforms, and technology solutions.',
  supportHandle: SUPPORT_HANDLE,
  supportUrl: '',
  socialWebsite: 'https://vvraju.netlify.app/',
  socialGithub: 'https://github.com/vvraju56',
  socialLinkedin: 'https://www.linkedin.com/in/vishnuraju-v-757b9929b',
  business: {
    showBusinessInfo: true,
    enterpriseName: SITE_NAME,
    businessType: 'Micro Enterprise',
    majorActivity: 'Services',
    industry: 'Computer Programming / Consultancy Related Activities',
    registrationNote:
      "Official business information is based on the company's Udyam registration.",
  },
};

export const CONTACT_SUBJECTS = [
  'Project enquiry',
  'Product question',
  'Partnership',
  'General',
  'Something else',
];

export const PROJECT_TYPES = [
  'Web application',
  'Mobile application',
  'Software product',
  'API / backend',
  'AI / automation',
  'UI/UX',
  'Not sure yet',
];

export const BUDGET_OPTIONS = [
  'Not sure yet',
  'Under ₹25,000',
  '₹25,000 – ₹75,000',
  '₹75,000 – ₹2,00,000',
  '₹2,00,000+',
  'Prefer to discuss',
];

export const SUPPORT_ISSUE_TYPES = [
  'Product Support',
  'Bug Report',
  'Feature Request',
  'Account Help',
  'Documentation',
  'General',
] as const;
