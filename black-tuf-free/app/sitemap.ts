import type { MetadataRoute } from "next";
import { getPublicBlogPosts, getPublicPortfolio } from "@/services/public";

const STATIC_ROUTES = [
  "",
  "/services",
  "/projects",
  "/engineers",
  "/portfolio",
  "/pricing",
  "/faq",
  "/contact",
  "/book-consultation",
  "/request-quote",
  "/support",
  "/terms",
  "/privacy",
  "/refund",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://black-tuf.vercel.app").replace(/\/+$/, "");

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));

  // Dynamic routes are added best-effort — a missing/migrating table must
  // never break the production build.
  try {
    const [blogPosts, portfolio] = await Promise.all([
      getPublicBlogPosts().catch(() => []),
      getPublicPortfolio().catch(() => []),
    ]);

    for (const post of blogPosts) {
      entries.push({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.published_at ? new Date(post.published_at) : new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }

    for (const project of portfolio) {
      entries.push({
        url: `${baseUrl}/projects/${project.id}`,
        lastModified: project.updated_at ? new Date(project.updated_at) : new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  } catch {
    // Fall through with static routes only.
  }

  return entries;
}
