import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicBlogPost } from "@/services/public";
import { PublicShell } from "@/features/site/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let post = null;
  try {
    post = await getPublicBlogPost(slug);
  } catch {
    post = null;
  }
  if (!post) notFound();

  return (
    <PublicShell>
      <article className="container mx-auto max-w-3xl px-6 py-16 md:py-20">
        <Button variant="ghost" size="sm" asChild className="mb-6 -ml-3">
          <Link href="/blog"><ArrowLeft className="h-4 w-4 mr-2" /> Back to blog</Link>
        </Button>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {post.published_at ? <span>{formatDate(post.published_at)}</span> : null}
          {post.author?.full_name ? (
            <>
              <span>·</span>
              <span>by {post.author.full_name}</span>
            </>
          ) : null}
        </div>

        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">{post.title}</h1>

        {post.tags && post.tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {post.tags.map((t) => (
              <Badge key={t} variant="secondary">{t}</Badge>
            ))}
          </div>
        ) : null}

        <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-foreground/90">
          {post.content
            ? post.content.split(/\n{2,}/).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))
            : null}
        </div>
      </article>
    </PublicShell>
  );
}
