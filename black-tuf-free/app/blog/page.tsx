import Link from "next/link";
import { getPublicBlogPosts } from "@/services/public";
import { PublicShell } from "@/features/site/shell";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Newspaper, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@/types";

export default async function BlogPage() {
  let posts: BlogPost[] = [];
  try {
    posts = await getPublicBlogPosts();
  } catch {
    posts = [];
  }

  return (
    <PublicShell>
      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
          <p className="mt-4 text-muted-foreground">
            Insights on engineering, design, IoT and the way we build software.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="mt-12">
            <EmptyState
              icon={Newspaper}
              title="No posts yet"
              description="Stories and insights are on their way."
            />
          </div>
        ) : (
          <div className="mx-auto mt-12 grid max-w-4xl gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group rounded-xl border glass p-6 transition-colors hover:border-primary/40"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {post.published_at ? <span>{formatDate(post.published_at)}</span> : null}
                  {post.author?.full_name ? (
                    <>
                      <span>·</span>
                      <span>{post.author.full_name}</span>
                    </>
                  ) : null}
                </div>
                <h2 className="mt-2 text-xl font-semibold group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                {post.excerpt ? (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                ) : null}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {(post.tags ?? []).slice(0, 4).map((t) => (
                      <Badge key={t} variant="secondary">{t}</Badge>
                    ))}
                  </div>
                  <span className="flex items-center gap-1 text-sm text-primary">
                    Read <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PublicShell>
  );
}
