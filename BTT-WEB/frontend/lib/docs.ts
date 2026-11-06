export type DocBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'steps'; items: { title: string; description: string }[] }
  | { type: 'code'; language: string; code: string }
  | { type: 'callout'; title: string; text: string }
  | { type: 'endpoint'; method: string; path: string; description: string };

export interface DocSection {
  id: string;
  title: string;
  blocks: DocBlock[];
}

export interface DocPage {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  group: 'Start here' | 'Platform' | 'Reference';
  sections: DocSection[];
}

export const DOC_PAGES: DocPage[] = [
  {
    slug: 'getting-started',
    title: 'Getting started',
    description: 'How the BlackTuf product hub is organised and where to go next.',
    eyebrow: 'Documentation',
    group: 'Start here',
    sections: [
      {
        id: 'overview',
        title: 'Overview',
        blocks: [
          {
            type: 'paragraph',
            text: 'This site is the official home of BlackTuf Technologies and the central directory for every product we publish. It brings the product catalogue, documentation, support, and company information into one place.',
          },
          {
            type: 'paragraph',
            text: 'Product data lives in MongoDB and is managed through a private admin dashboard. When a product is published, it appears in the directory, gets its own page, joins search, and can be featured on the homepage — no redesign required.',
          },
          {
            type: 'callout',
            title: 'A directory, not a brochure',
            text: 'Every published product has a dedicated page at /products/[slug]. Use the directory to discover what exists; use the product page to reach the live product, its documentation, or support.',
          },
        ],
      },
      {
        id: 'what-you-will-find',
        title: "What you'll find",
        blocks: [
          {
            type: 'list',
            items: [
              'A searchable, filterable product directory.',
              'Individual product pages with features, technology, links, and changelog information where configured.',
              'A services overview describing the work BlackTuf takes on.',
              'Documentation for the platform and product-level links.',
              'Support and contact forms that reach the BlackTuf team.',
            ],
          },
        ],
      },
      {
        id: 'quick-start',
        title: 'Quick start',
        blocks: [
          {
            type: 'steps',
            items: [
              {
                title: 'Browse the directory',
                description: 'Open Products and filter by category, status, or featured products.',
              },
              {
                title: 'Open a product',
                description:
                  'Select a product to read its overview, features, screenshots, and technology.',
              },
              {
                title: 'Choose your next step',
                description:
                  'Visit the product, read its documentation, open GitHub, or contact support. Only configured links are shown.',
              },
            ],
          },
        ],
      },
      {
        id: 'support',
        title: 'Getting help',
        blocks: [
          {
            type: 'paragraph',
            text: 'If you need help with a BlackTuf product, use the support centre. Include the product name and a clear description of what you expected and what happened instead.',
          },
          {
            type: 'paragraph',
            text: 'You can also reach the support identity @blacktuftech. When an official support URL is configured, the handle becomes clickable.',
          },
        ],
      },
    ],
  },
  {
    slug: 'products',
    title: 'Products',
    description: 'How the BlackTuf product directory, statuses, and product pages work.',
    eyebrow: 'Platform',
    group: 'Start here',
    sections: [
      {
        id: 'directory',
        title: 'The product directory',
        blocks: [
          {
            type: 'paragraph',
            text: 'The Products page lists every published product. Filters for category, status, and featured products are generated from the actual catalogue, so empty categories are never shown.',
          },
          {
            type: 'list',
            items: [
              'Search matches product names, descriptions, categories, technologies, and features.',
              'Sort options include featured, newest, oldest, and name.',
              'The grid adapts from one column on mobile to three on desktop.',
            ],
          },
        ],
      },
      {
        id: 'statuses',
        title: 'Product statuses',
        blocks: [
          {
            type: 'list',
            items: [
              'Active — the product is live and available.',
              'Beta — the product is available but still changing.',
              'Coming Soon — the product has not launched yet.',
              'Maintenance — the product exists but is temporarily limited or being worked on.',
              'Archived — the product is no longer actively developed.',
            ],
          },
          {
            type: 'paragraph',
            text: 'Statuses are set by the administrator. A product is never marked Active automatically.',
          },
        ],
      },
      {
        id: 'product-page',
        title: 'What is on a product page',
        blocks: [
          {
            type: 'list',
            items: [
              'Product identity, category, status, and short description.',
              'Overview and feature cards.',
              'A screenshot gallery and lightbox when screenshots are configured.',
              'Technology tags and a step-by-step explanation of how the product works.',
              'Pricing type and release information, when configured.',
              'Links to the product website, documentation, GitHub, support, and contact.',
              'Frequently asked questions and a changelog, when configured.',
            ],
          },
          {
            type: 'callout',
            title: 'Only real information is shown',
            text: 'Sections without configured data are hidden. Pricing without a configured type shows “Pricing information coming soon.” instead of an invented price.',
          },
        ],
      },
      {
        id: 'coming-soon',
        title: 'Coming soon products',
        blocks: [
          {
            type: 'paragraph',
            text: 'A product with the Coming Soon status shows a launch notice and an optional Notify Me form. Email addresses submitted through that form are stored in MongoDB and used only for launch updates for that product.',
          },
        ],
      },
    ],
  },
  {
    slug: 'guides',
    title: 'Guides',
    description: 'Practical guides for support, bug reports, and feature requests.',
    eyebrow: 'Guides',
    group: 'Platform',
    sections: [
      {
        id: 'support-routes',
        title: 'Choosing the right support route',
        blocks: [
          {
            type: 'list',
            items: [
              'Product Support — usage questions and account help for a specific product.',
              'Bug Report — something is broken or behaves differently from what is documented.',
              'Feature Request — a capability you would like a product to have.',
              'Documentation — missing, unclear, or incorrect documentation.',
              'General — anything that does not fit the categories above.',
            ],
          },
        ],
      },
      {
        id: 'bug-report',
        title: 'Writing a useful bug report',
        blocks: [
          {
            type: 'steps',
            items: [
              {
                title: 'Start with the product',
                description: 'Select the product in the support form so the request is routed correctly.',
              },
              {
                title: 'Describe the expected behaviour',
                description: 'Say what you expected to happen in plain language.',
              },
              {
                title: 'Describe what happened instead',
                description:
                  'Include the exact error message, the page or screen, and the steps that reproduce it.',
              },
              {
                title: 'Attach evidence when useful',
                description:
                  'A screenshot or short document helps. Do not include passwords, tokens, or private personal information.',
              },
            ],
          },
        ],
      },
      {
        id: 'feature-request',
        title: 'Requesting a feature',
        blocks: [
          {
            type: 'paragraph',
            text: 'Explain the problem before the solution. A request that starts with “I am trying to…” gives more useful context than a single feature name. Include how often you would use it and what you currently do instead.',
          },
        ],
      },
      {
        id: 'reporting-security',
        title: 'Reporting a security issue',
        blocks: [
          {
            type: 'callout',
            title: 'Do not post sensitive details publicly',
            text: 'Use the contact form with the subject “Security” and describe the issue at a high level. Do not include credentials, private data, or exploit details in a general support request.',
          },
        ],
      },
    ],
  },
  {
    slug: 'api',
    title: 'API reference',
    description: 'Public read endpoints for the BlackTuf product catalogue.',
    eyebrow: 'Reference',
    group: 'Reference',
    sections: [
      {
        id: 'base-url',
        title: 'Base URL',
        blocks: [
          {
            type: 'paragraph',
            text: 'The website reads from a REST API built with Node.js, Express, and MongoDB. The public API is read-only, with the exception of the contact, support, and launch-notification endpoints used by the website forms.',
          },
          {
            type: 'code',
            language: 'text',
            code: 'https://your-api-host/api',
          },
        ],
      },
      {
        id: 'public-endpoints',
        title: 'Public endpoints',
        blocks: [
          {
            type: 'endpoint',
            method: 'GET',
            path: '/api/products',
            description: 'Published products. Supports search, category, status, featured, sort, and limit query parameters.',
          },
          {
            type: 'endpoint',
            method: 'GET',
            path: '/api/products/:slug',
            description: 'A single published product, including features, screenshots, technologies, FAQs, and changelog.',
          },
          {
            type: 'endpoint',
            method: 'GET',
            path: '/api/categories',
            description: 'Categories that currently contain at least one published product.',
          },
          {
            type: 'endpoint',
            method: 'GET',
            path: '/api/services',
            description: 'Published services.',
          },
          {
            type: 'endpoint',
            method: 'GET',
            path: '/api/settings',
            description: 'Public site settings: company name, support identity, and configured social links.',
          },
          {
            type: 'endpoint',
            method: 'GET',
            path: '/api/health',
            description: 'Service health check.',
          },
        ],
      },
      {
        id: 'response-shape',
        title: 'Response shape',
        blocks: [
          {
            type: 'code',
            language: 'json',
            code: `{
  "success": true,
  "data": [],
  "total": 0
}`,
          },
          {
            type: 'paragraph',
            text: 'Errors use the same envelope with success set to false, a human-readable message, and an optional errors array for field-level validation details.',
          },
        ],
      },
      {
        id: 'forms',
        title: 'Form endpoints',
        blocks: [
          {
            type: 'endpoint',
            method: 'POST',
            path: '/api/contact',
            description: 'Validated contact message. Rate limited and protected by a honeypot field.',
          },
          {
            type: 'endpoint',
            method: 'POST',
            path: '/api/support',
            description: 'Multipart support request with an optional attachment. Rate limited and validated server-side.',
          },
          {
            type: 'endpoint',
            method: 'POST',
            path: '/api/products/:slug/notify',
            description: 'Launch notification signup for a published product.',
          },
        ],
      },
      {
        id: 'limits',
        title: 'Limits and authentication',
        blocks: [
          {
            type: 'list',
            items: [
              'Public API requests are rate limited per IP address.',
              'Contact and support submissions have stricter limits.',
              'Admin endpoints require an HTTP-only JWT cookie and are not part of the public API.',
              'No MongoDB or Cloudinary credentials are exposed to the browser.',
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'faqs',
    title: 'FAQs',
    description: 'Common questions about the BlackTuf website and products.',
    eyebrow: 'Help',
    group: 'Reference',
    sections: [
      {
        id: 'products-list',
        title: 'Are all BlackTuf products listed here?',
        blocks: [
          {
            type: 'paragraph',
            text: 'This site is the central directory for products that have been published through the admin dashboard. Unpublished drafts are intentionally hidden. If a product is not listed, it has not been published yet.',
          },
        ],
      },
      {
        id: 'updates',
        title: 'How often is the site updated?',
        blocks: [
          {
            type: 'paragraph',
            text: 'Product data is stored in MongoDB. The public site revalidates product content periodically and always fetches the latest product details when a page is generated on the server.',
          },
        ],
      },
      {
        id: 'account',
        title: 'Do I need an account?',
        blocks: [
          {
            type: 'paragraph',
            text: 'No public account is required to browse products, read documentation, or contact support. Individual products may have their own account systems; check the product page and its documentation.',
          },
        ],
      },
      {
        id: 'pricing',
        title: 'Why do some products not show pricing?',
        blocks: [
          {
            type: 'paragraph',
            text: 'Pricing is only displayed when it has been explicitly configured. Otherwise the page says that pricing information is coming soon. Prices are never generated or estimated.',
          },
        ],
      },
      {
        id: 'support',
        title: 'How do I get support?',
        blocks: [
          {
            type: 'paragraph',
            text: 'Use the support form and choose the product and issue type. For general questions, use the contact form. The support identity is @blacktuftech.',
          },
        ],
      },
    ],
  },
  {
    slug: 'troubleshooting',
    title: 'Troubleshooting',
    description: 'Fixes for common issues with the website and forms.',
    eyebrow: 'Help',
    group: 'Reference',
    sections: [
      {
        id: 'missing-link',
        title: 'A product link is missing',
        blocks: [
          {
            type: 'paragraph',
            text: 'Product links are only rendered when the administrator has configured them. A missing website, GitHub, or documentation button means that link has not been published for that product.',
          },
        ],
      },
      {
        id: 'form-error',
        title: 'A form will not submit',
        blocks: [
          {
            type: 'list',
            items: [
              'Check required fields and the email address format.',
              'Messages require at least 10 characters; support requests also require a description.',
              'Attachments must be under 8 MB and one of the supported file types.',
              'Repeated submissions may be rate limited. Wait before trying again.',
              'If attachments are unavailable, submit without a file and mention it in the message.',
            ],
          },
        ],
      },
      {
        id: 'search-empty',
        title: 'Search returns no results',
        blocks: [
          {
            type: 'paragraph',
            text: 'Clear the category and status filters, then try a broader term. The directory search covers product names, descriptions, categories, technologies, and features — not the full text of external documentation.',
          },
        ],
      },
      {
        id: 'not-found',
        title: 'A product page returns 404',
        blocks: [
          {
            type: 'paragraph',
            text: 'The product may have been unpublished, renamed, or removed. Return to the product directory to see what is currently available.',
          },
        ],
      },
      {
        id: 'accessibility',
        title: 'Accessibility issue',
        blocks: [
          {
            type: 'paragraph',
            text: 'If any part of the site is difficult to use with a keyboard, screen reader, or at a particular zoom level, contact support and describe the page and the barrier. Accessibility reports are treated as bugs.',
          },
        ],
      },
    ],
  },
  {
    slug: 'changelog',
    title: 'Changelog',
    description: 'Changes to the BlackTuf Technologies website and product hub.',
    eyebrow: 'Reference',
    group: 'Reference',
    sections: [
      {
        id: 'v1-0-0',
        title: 'v1.0.0 — Initial release',
        blocks: [
          {
            type: 'paragraph',
            text: 'The BlackTuf Technologies website and product hub launched with a MongoDB-backed product catalogue and a private admin dashboard.',
          },
          {
            type: 'list',
            items: [
              'Product directory with search, filters, sorting, and featured products.',
              'Dynamic product pages generated from the database.',
              'Global command palette with Ctrl+K.',
              'Services, about, support, contact, documentation, and legal pages.',
              'Admin authentication with JWT and bcrypt, product and service management, uploads, and message inboxes.',
              'SEO metadata, JSON-LD, sitemap, robots.txt, and Open Graph imagery.',
            ],
          },
        ],
      },
      {
        id: 'product-changelogs',
        title: 'Product changelogs',
        blocks: [
          {
            type: 'paragraph',
            text: 'Product-specific release notes are shown on each product page when the administrator configures them. They are not duplicated here.',
          },
        ],
      },
    ],
  },
];

export function getDocPage(slug: string) {
  return DOC_PAGES.find((page) => page.slug === slug) ?? null;
}

export function getDocNav() {
  const groups: Record<string, { label: string; href: string }[]> = {};
  for (const page of DOC_PAGES) {
    groups[page.group] = groups[page.group] || [];
    groups[page.group].push({ label: page.title, href: `/docs/${page.slug}` });
  }
  return Object.entries(groups).map(([group, items]) => ({ group, items }));
}

export function getDocNeighbours(slug: string) {
  const index = DOC_PAGES.findIndex((page) => page.slug === slug);
  return {
    previous: index > 0 ? DOC_PAGES[index - 1] : null,
    next: index >= 0 && index < DOC_PAGES.length - 1 ? DOC_PAGES[index + 1] : null,
  };
}

export function docText(page: DocPage) {
  return [
    page.title,
    page.description,
    ...page.sections.flatMap((section) => [
      section.title,
      ...section.blocks.flatMap((block) => {
        if (block.type === 'paragraph') return [block.text];
        if (block.type === 'list') return block.items;
        if (block.type === 'steps')
          return block.items.flatMap((item) => [item.title, item.description]);
        if (block.type === 'callout') return [block.title, block.text];
        if (block.type === 'endpoint') return [block.method, block.path, block.description];
        return [block.code];
      }),
    ]),
  ].join(' ');
}
