/**
 * Seed the MongoDB database with BlackTuf's real, existing products.
 *
 * Safe by default: existing products and services are left untouched.
 * Run `npm run seed -- --force` to refresh the seeded content.
 *
 * There are deliberately no invented products, customers, awards, or metrics.
 */
import { connectDatabase, disconnectDatabase } from '../config/db.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { ProductFeature } from '../models/ProductFeature.js';
import { ProductScreenshot } from '../models/ProductScreenshot.js';
import { ProductTechnology } from '../models/ProductTechnology.js';
import { ProductFaq } from '../models/ProductFaq.js';
import { ProductChangelog } from '../models/ProductChangelog.js';
import { Service } from '../models/Service.js';
import { SiteSettings } from '../models/SiteSettings.js';

const force = process.argv.includes('--force');

const categories = [
  { name: 'Business', slug: 'business', order: 1 },
  { name: 'Mobile Applications', slug: 'mobile-applications', order: 2 },
  { name: 'Developer Tools', slug: 'developer-tools', order: 3 },
];

const products = [
  {
    name: 'Makeable Jobs',
    slug: 'makeable-jobs',
    category: 'business',
    shortDescription:
      'One search, every opportunity. A job aggregation platform that brings listings from multiple portals into one focused search.',
    description:
      'Makeable Jobs is a job aggregation platform built for people who want one place to search across multiple job portals. Listings are normalised into a consistent experience, and every application is completed on the original publisher’s website — job content stays with its source.\n\nThe platform also includes resume and interview preparation tools, company discovery, saved roles, and a companion mobile app.',
    logoUrl: '/products/makeable-jobs-logo.png',
    bannerUrl: '',
    status: 'Active',
    websiteUrl: 'https://makeable-jobs.vercel.app',
    githubUrl: '',
    documentationUrl: '',
    supportUrl: '',
    version: '1.0.0',
    pricingType: '',
    pricingNote: '',
    howItWorks: [
      {
        title: 'Search across sources',
        description:
          'Search aggregated listings from multiple job portals from one place instead of repeating the same search everywhere.',
      },
      {
        title: 'Review the opportunity',
        description:
          'Compare role details, company information, and the original listing before deciding where to apply.',
      },
      {
        title: 'Apply at the source',
        description:
          'Complete your application on the original publisher’s website. Makeable Jobs always points back to the source.',
      },
    ],
    features: [
      {
        icon: 'Search',
        title: 'Aggregated discovery',
        description: 'Bring listings from multiple job portals into one focused search experience.',
      },
      {
        icon: 'ExternalLink',
        title: 'Original-source applications',
        description:
          'Every listing links back to the original publisher so you apply where the job actually lives.',
      },
      {
        icon: 'FileText',
        title: 'Resume and interview tools',
        description:
          'AI-assisted resume scoring, cover letter generation, and skill-gap analysis help you prepare.',
      },
      {
        icon: 'Building2',
        title: 'Company discovery',
        description: 'Explore companies with open roles and understand who is hiring.',
      },
      {
        icon: 'Bookmark',
        title: 'Saved roles and alerts',
        description: 'Keep track of interesting roles and set up alerts for the searches that matter.',
      },
      {
        icon: 'Smartphone',
        title: 'Web and Android',
        description: 'Use Makeable Jobs in the browser or through the companion Android app.',
      },
    ],
    technologies: [
      'Next.js',
      'React',
      'TypeScript',
      'Tailwind CSS',
      'Flutter',
      'FastAPI',
      'PostgreSQL',
      'Redis',
    ],
    faqs: [
      {
        question: 'Where do the job listings come from?',
        answer:
          'Listings are aggregated from public job portals and company career pages. Each listing links to its original source, and applications are completed on that source website.',
      },
      {
        question: 'Does Makeable Jobs own the job listings?',
        answer:
          'No. Job content belongs to the original publisher. Makeable Jobs normalises listing metadata and directs you to the canonical application page.',
      },
    ],
    changelog: [],
    featured: true,
    published: true,
    order: 1,
    seoTitle: 'Makeable Jobs — One Search. Every Opportunity.',
    seoDescription:
      'Search job listings from multiple portals in one place and apply on the original website. A BlackTuf Technologies product.',
  },
  {
    name: 'Vibranium Music',
    slug: 'vibranium-music',
    category: 'mobile-applications',
    shortDescription:
      'A premium, local-first music discovery app for Android with multilingual discovery, playlists, and synchronized lyrics.',
    description:
      'Vibranium Music is a music discovery and playback app for Android focused on Indian languages alongside international and independent music. It uses YouTube video metadata for discovery and authorized direct-audio sources for playback.\n\nThe experience is local-first: no account is required, and preferences, favorites, playlists, history, and queue state stay on the device. Language selection shapes a personalised home feed, while synchronized lyrics, smart recommendations, and a full media session round out the player.\n\nVibranium Music does not download, extract, convert, proxy, or ad-block YouTube content. Metadata results are never treated as playable stream URLs.',
    logoUrl: '/products/vibranium-music-logo.png',
    bannerUrl: '',
    status: 'Beta',
    websiteUrl: '',
    githubUrl: '',
    documentationUrl: '',
    supportUrl: '',
    version: '1.0.0',
    pricingType: '',
    pricingNote: '',
    howItWorks: [
      {
        title: 'Choose your languages',
        description:
          'Pick the languages you listen to during onboarding. Your home feed is built around those preferences.',
      },
      {
        title: 'Discover and search',
        description:
          'Explore music through search, recommendations, playlists, and a personalised home feed.',
      },
      {
        title: 'Listen your way',
        description:
          'Build a local library, follow synchronized lyrics, and control playback from the app or your lock screen.',
      },
    ],
    features: [
      {
        icon: 'Languages',
        title: 'Language-first discovery',
        description:
          'Personalise the home experience around the Indian and international languages you actually listen to.',
      },
      {
        icon: 'HardDrive',
        title: 'Local-first library',
        description:
          'No account needed. Preferences, favorites, playlists, history, and queue state stay on your device.',
      },
      {
        icon: 'Mic2',
        title: 'Synchronized lyrics',
        description:
          'Timestamped lyrics with automatic line highlighting, seek-to-line controls, and an on-device cache.',
      },
      {
        icon: 'ListMusic',
        title: 'Playlists and queue',
        description:
          'Favorites, playlists, shuffle, repeat, and a persistent queue in one media session.',
      },
      {
        icon: 'Headphones',
        title: 'Background playback',
        description:
          'Notification, lock-screen, and Bluetooth controls for authorized direct-audio sources.',
      },
      {
        icon: 'Sparkles',
        title: 'Local recommendations',
        description:
          'Recommendations use language, genre, artist, and listening history signals — calculated locally.',
      },
    ],
    technologies: [
      'Kotlin',
      'Jetpack Compose',
      'AndroidX Media3',
      'ExoPlayer',
      'Room',
      'Material 3',
    ],
    faqs: [
      {
        question: 'Do I need a Vibranium Music account?',
        answer: 'No. The app is local-first and does not require an account or sign-in.',
      },
      {
        question: 'Can I download music with the app?',
        answer:
          'No. Vibranium Music does not download, extract, convert, or proxy YouTube content. Playback is limited to authorized direct-audio sources.',
      },
    ],
    changelog: [],
    featured: true,
    published: true,
    order: 2,
    seoTitle: 'Vibranium Music — Music Discovery for Android',
    seoDescription:
      'A local-first Android music discovery app with multilingual discovery, playlists, synchronized lyrics, and background playback.',
  },
  {
    name: 'BTT WhatsApp Bridge',
    slug: 'btt-whatsapp-bridge',
    category: 'developer-tools',
    shortDescription:
      'A Node.js bridge that connects WhatsApp Business to an n8n AI agent for automated support conversations.',
    description:
      'BTT WhatsApp Bridge connects a WhatsApp Business account to a BlackTuf AI agent hosted in n8n. It receives one-to-one text messages, forwards each unique message to an n8n webhook with a shared-secret header, and sends the AI reply back to the same conversation.\n\nThe bridge includes session persistence, duplicate-message protection, timeouts, structured logging, and health and status endpoints for monitoring.\n\nIt uses WhatsApp Web automation rather than the official Meta WhatsApp Cloud API. It is intended for development and testing; confirm platform policy and production suitability before relying on it for commercial support.',
    logoUrl: '/products/btt-whatsapp-bridge-logo.svg',
    bannerUrl: '',
    status: 'Beta',
    websiteUrl: '',
    githubUrl: '',
    documentationUrl: '',
    supportUrl: '',
    version: '1.0.0',
    pricingType: '',
    pricingNote: '',
    howItWorks: [
      {
        title: 'Pair the WhatsApp account',
        description:
          'Start the bridge and pair the WhatsApp Business account using the generated QR code.',
      },
      {
        title: 'Forward the conversation',
        description:
          'Incoming one-to-one text messages are normalised and sent securely to the n8n webhook.',
      },
      {
        title: 'Reply from the agent',
        description:
          'The AI agent response is returned to the bridge and delivered to the same WhatsApp conversation.',
      },
    ],
    features: [
      {
        icon: 'MessageCircle',
        title: 'WhatsApp connection',
        description:
          'Connect a WhatsApp Business account through WhatsApp Web with a persistent local session.',
      },
      {
        icon: 'Bot',
        title: 'n8n agent handoff',
        description:
          'Forward messages to an n8n workflow with a shared-secret header and a defined timeout.',
      },
      {
        icon: 'ShieldCheck',
        title: 'Duplicate protection',
        description:
          'A processed-message store prevents the same incoming message from being handled twice.',
      },
      {
        icon: 'Activity',
        title: 'Monitoring endpoints',
        description:
          'Health and status routes make it easier to observe the bridge while it is running.',
      },
      {
        icon: 'Settings2',
        title: 'Environment-only config',
        description:
          'Credentials and webhook settings are read from environment variables, not hard-coded.',
      },
      {
        icon: 'ScrollText',
        title: 'Structured logs',
        description:
          'Structured logging and graceful shutdown support day-to-day development and testing.',
      },
    ],
    technologies: ['Node.js', 'Express', 'JavaScript', 'whatsapp-web.js', 'n8n'],
    faqs: [
      {
        question: 'Is this the official WhatsApp Business API?',
        answer:
          'No. The bridge uses whatsapp-web.js and WhatsApp Web automation. For production customer support, the official Meta WhatsApp Cloud API should be evaluated.',
      },
      {
        question: 'Is it suitable for bulk messaging?',
        answer:
          'No. It is designed for one-to-one support conversations and should not be used for bulk messaging, spam, or unsolicited outreach.',
      },
    ],
    changelog: [],
    featured: true,
    published: true,
    order: 3,
    seoTitle: 'BTT WhatsApp Bridge — WhatsApp to n8n AI Agent',
    seoDescription:
      'A Node.js bridge connecting WhatsApp Business to an n8n AI agent, with session persistence, duplicate protection, and monitoring.',
  },
];

const services = [
  {
    title: 'Software Development',
    slug: 'software-development',
    shortDescription: 'Modern web and software applications built around real requirements.',
    description:
      'End-to-end software development for practical products. We work from the problem outward: define the scope, build the smallest useful version, and improve it with real feedback.',
    icon: 'Code2',
    features: ['Product engineering', 'Modern web stacks', 'Maintainable architecture', 'Iterative delivery'],
  },
  {
    title: 'Web Development',
    slug: 'web-development',
    shortDescription: 'Responsive, fast, and scalable web experiences.',
    description:
      'Websites and web applications built with attention to performance, accessibility, SEO, and responsive behaviour across desktop, tablet, and mobile.',
    icon: 'Globe2',
    features: ['Next.js and React', 'Responsive interfaces', 'SEO foundations', 'Performance budgets'],
  },
  {
    title: 'Application Development',
    slug: 'application-development',
    shortDescription: 'Custom digital applications for the way people actually work.',
    description:
      'Custom applications that turn a workflow into a focused product. From data model and API to interface and release, the pieces are designed to fit together.',
    icon: 'Smartphone',
    features: ['Custom workflows', 'Cross-platform thinking', 'Offline-first options', 'Clear release paths'],
  },
  {
    title: 'API & Backend Development',
    slug: 'api-backend-development',
    shortDescription: 'Reliable backend systems and APIs that products can build on.',
    description:
      'Backend services, REST APIs, authentication, database design, and integrations built with security and maintainability in mind.',
    icon: 'ServerCog',
    features: ['REST APIs', 'Authentication and roles', 'Database modelling', 'Validation and rate limiting'],
  },
  {
    title: 'AI & Automation',
    slug: 'ai-automation',
    shortDescription: 'AI-powered applications and workflow automation.',
    description:
      'Practical AI integration and automation: agent-assisted support, content workflows, and tool connections that remove repetitive work without hiding how they behave.',
    icon: 'Bot',
    features: ['AI agent integration', 'Workflow automation', 'Tool integrations', 'Human-review paths'],
  },
  {
    title: 'UI/UX Development',
    slug: 'ui-ux-development',
    shortDescription: 'Modern interfaces and considered user experiences.',
    description:
      'Interface design and front-end development focused on clarity, accessibility, and the small interaction details that make a product feel finished.',
    icon: 'PenTool',
    features: ['Design systems', 'Accessible components', 'Interaction design', 'Responsive layouts'],
  },
];

const defaultSettings = {
  key: 'site',
  companyName: 'BlackTuf Technologies',
  brandName: 'BlackTuf',
  tagline: 'Building Technology That Moves Ideas Forward.',
  description: 'Building modern software products, digital platforms, and technology solutions.',
  supportHandle: '@blacktuftech',
  supportUrl: '',
  socialWebsite: 'https://vvraju.netlify.app/',
  socialGithub: 'https://github.com/vvraju56',
  socialLinkedin: 'https://www.linkedin.com/in/vishnuraju-v-757b9929b',
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

async function syncChildren(product, data) {
  await Promise.all([
    ProductFeature.deleteMany({ product: product._id }),
    ProductScreenshot.deleteMany({ product: product._id }),
    ProductTechnology.deleteMany({ product: product._id }),
    ProductFaq.deleteMany({ product: product._id }),
    ProductChangelog.deleteMany({ product: product._id }),
  ]);

  await Promise.all([
    ProductFeature.insertMany(
      data.features.map((feature, index) => ({
        product: product._id,
        ...feature,
        order: index,
      }))
    ),
    data.technologies.length
      ? ProductTechnology.insertMany(
          data.technologies.map((name, index) => ({ product: product._id, name, order: index }))
        )
      : null,
    data.faqs.length
      ? ProductFaq.insertMany(
          data.faqs.map((faq, index) => ({ product: product._id, ...faq, order: index }))
        )
      : null,
  ]);
}

async function run() {
  await connectDatabase();
  console.log(`[seed] Mode: ${force ? 'force refresh' : 'create missing only'}`);

  const categoryMap = {};
  for (const item of categories) {
    const category = await Category.findOneAndUpdate(
      { slug: item.slug },
      { $setOnInsert: item },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    categoryMap[item.slug] = category;
  }
  console.log(`[seed] Categories ready: ${Object.keys(categoryMap).length}`);

  for (const item of products) {
    const existing = await Product.findOne({ slug: item.slug });
    if (existing && !force) {
      console.log(`[seed] Product exists, skipped: ${item.name}`);
      continue;
    }

    const category = categoryMap[item.category];
    const fields = {
      name: item.name,
      slug: item.slug,
      shortDescription: item.shortDescription,
      description: item.description,
      logoUrl: item.logoUrl,
      bannerUrl: item.bannerUrl,
      category: category._id,
      status: item.status,
      websiteUrl: item.websiteUrl,
      githubUrl: item.githubUrl,
      documentationUrl: item.documentationUrl,
      supportUrl: item.supportUrl,
      version: item.version,
      pricingType: item.pricingType,
      pricingNote: item.pricingNote,
      howItWorks: item.howItWorks,
      featured: item.featured,
      published: item.published,
      order: item.order,
      seoTitle: item.seoTitle,
      seoDescription: item.seoDescription,
    };

    let product;
    if (existing) {
      product = await Product.findByIdAndUpdate(existing._id, fields, {
        new: true,
        runValidators: true,
      });
    } else {
      product = await Product.create(fields);
    }
    await syncChildren(product, item);
    console.log(`[seed] Product ${existing ? 'refreshed' : 'created'}: ${item.name}`);
  }

  for (const item of services) {
    const existing = await Service.findOne({ slug: item.slug });
    if (existing && !force) {
      continue;
    }
    if (existing) {
      await Service.findByIdAndUpdate(existing._id, item, { runValidators: true });
    } else {
      await Service.create({ ...item, published: true });
    }
    console.log(`[seed] Service ready: ${item.title}`);
  }

  await SiteSettings.updateOne(
    { key: 'site' },
    { $setOnInsert: defaultSettings },
    { upsert: true }
  );
  console.log('[seed] Site settings ready');
  console.log('[seed] Done. Create an admin with `npm run seed:admin`.');
}

run()
  .catch((error) => {
    console.error('[seed] Failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });
