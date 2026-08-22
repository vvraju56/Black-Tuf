"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAdminBlog, useBlogPostMutation } from "@/hooks/use-admin";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, Loader2, Newspaper } from "lucide-react";

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function BlogForm({
  initial,
  onDone,
}: {
  initial?: { id: string; title: string; slug: string; excerpt: string; content: string; tags: string[] };
  onDone: () => void;
}) {
  const { create, update } = useBlogPostMutation();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [saving, setSaving] = useState(false);

  const save = async (publish: boolean) => {
    if (!title || !slug) {
      toast.error("Title and slug are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title,
        slug,
        excerpt,
        content,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        is_published: publish,
        published_at: publish ? new Date().toISOString() : null,
      };
      if (initial) await update(initial.id, payload);
      else await create(payload);
      toast.success(publish ? "Post published" : "Draft saved");
      onDone();
    } catch (e: any) {
      toast.error("Failed to save", { description: e.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="blog-title">Title</Label>
          <Input
            id="blog-title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!initial || slug === slugify(initial.title)) setSlug(slugify(e.target.value));
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="blog-slug">Slug</Label>
          <Input id="blog-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="my-post-slug" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="blog-excerpt">Excerpt</Label>
        <Textarea id="blog-excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="blog-content">Content (paragraphs separated by a blank line)</Label>
        <Textarea id="blog-content" value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[160px]" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="blog-tags">Tags (comma separated)</Label>
        <Input id="blog-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="nextjs, iot, engineering" />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => void save(false)} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {initial ? "Update draft" : "Save draft"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => void save(true)} disabled={saving}>
          {initial?.id ? "Publish" : "Save & publish"}
        </Button>
      </div>
    </div>
  );
}

export function CmsPanel() {
  const blog = useAdminBlog();
  const { remove } = useBlogPostMutation();
  const [editing, setEditing] = useState<null | { id: string; title: string; slug: string; excerpt: string; content: string; tags: string[] }>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Newspaper className="h-4 w-4" /> Blog posts</CardTitle>
          <Button size="sm" onClick={() => { setCreating(!creating); setEditing(null); }}>
            <Plus className="h-4 w-4 mr-1" /> New post
          </Button>
        </CardHeader>
        <CardContent>
          {creating ? <BlogForm onDone={() => setCreating(false)} /> : null}

          {blog.isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (blog.data ?? []).length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No posts yet.</p>
          ) : (
            <div className="space-y-2">
              {(blog.data ?? []).map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{p.title}</p>
                    <p className="text-xs text-muted-foreground">
                      /blog/{p.slug} · {p.is_published ? "published" : "draft"}
                      {p.published_at ? ` · ${formatDate(p.published_at)}` : ""}
                    </p>
                    {(p.tags ?? []).length > 0 ? (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {p.tags.slice(0, 3).map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditing({ id: p.id, title: p.title, slug: p.slug, excerpt: p.excerpt, content: p.content, tags: p.tags });
                        setCreating(false);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={async () => {
                        if (!confirm("Delete this post?")) return;
                        try {
                          await remove(p.id);
                          toast.success("Post deleted");
                        } catch (e: any) {
                          toast.error("Delete failed", { description: e.message });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {editing ? (
        <Card>
          <CardContent className="pt-4">
            <BlogForm
              initial={editing}
              onDone={() => setEditing(null)}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
