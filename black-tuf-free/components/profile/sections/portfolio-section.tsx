"use client";

import { useEffect, useState } from "react";
import { FolderKanban, Code2, Link2, Pencil, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { SectionCard, EmptyState } from "@/components/profile/sections/section-card";
import { ImageCropDialog } from "@/components/profile/image-crop";
import { uploadFile, getPublicUrl } from "@/services/storage";
import {
  useUpsertPortfolioProject,
  useDeletePortfolioProject,
  useSetPortfolioOrder,
} from "@/hooks/use-profile";
import type { PortfolioProject } from "@/types";
import { toast } from "sonner";

const MAX_PROJECTS = 6;

export function PortfolioSection({
  projects = [],
  editable,
}: {
  projects?: PortfolioProject[];
  editable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PortfolioProject | null>(null);
  const remove = useDeletePortfolioProject();
  const reorder = useSetPortfolioOrder();

  const move = (index: number, dir: -1 | 1) => {
    const ids = projects.map((p) => p.id);
    const target = index + dir;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    reorder.mutate(ids, {
      onSuccess: () => toast.success("Order updated"),
      onError: (e) => toast.error(e.message ?? "Failed to reorder"),
    });
  };

  const add = () => {
    if (projects.length >= MAX_PROJECTS) {
      toast.error(`You can add up to ${MAX_PROJECTS} portfolio projects`);
      return;
    }
    setEditing(null);
    setOpen(true);
  };

  return (
    <SectionCard
      id="portfolio"
      title="Portfolio"
      description={editable ? `Showcase your best work (max ${MAX_PROJECTS})` : "Recent work"}
      icon={FolderKanban}
      action={
        editable ? (
          <Button size="sm" onClick={add}>
            <Plus className="h-4 w-4" /> Add Project
          </Button>
        ) : undefined
      }
    >
      {projects.length === 0 ? (
        <EmptyState
          message="No portfolio projects yet"
          hint="Share links to your best work so clients can review it."
          action={
            editable ? (
              <Button size="sm" variant="outline" onClick={add}>
                <Plus className="h-4 w-4" /> Add your first project
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <article
              key={p.id}
              className="group overflow-hidden rounded-xl border border-border/60 bg-background/40 transition-colors hover:border-primary/40"
            >
              <div className="relative aspect-video overflow-hidden bg-muted">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <FolderKanban className="h-8 w-8" />
                  </div>
                )}
                {editable && (
                  <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-7 w-7"
                      onClick={() => {
                        setEditing(p);
                        setOpen(true);
                      }}
                      aria-label="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-7 w-7 hover:bg-destructive"
                      onClick={() => {
                        if (confirm("Delete this portfolio project?"))
                          remove.mutate(p.id, { onSuccess: () => toast.success("Project deleted") });
                      }}
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="space-y-2 p-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="truncate text-sm font-semibold">{p.title}</h3>
                  {editable && (
                    <div className="flex shrink-0 gap-0.5">
                      <button onClick={() => move(i, -1)} className="text-muted-foreground hover:text-foreground" aria-label="Move up">
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button onClick={() => move(i, 1)} className="text-muted-foreground hover:text-foreground" aria-label="Move down">
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                {p.description && <p className="line-clamp-2 text-xs text-muted-foreground">{p.description}</p>}
                {(p.project_url || p.github_url) && (
                  <div className="flex items-center gap-2 text-[11px]">
                    {p.github_url && (
                      <a href={p.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                        <Code2 className="h-3 w-3" /> Code
                      </a>
                    )}
                    {p.project_url && (
                      <a href={p.project_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                        <Link2 className="h-3 w-3" /> View
                      </a>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <PortfolioDialog
        open={open}
        onOpenChange={setOpen}
        initial={editing}
        onSaved={() => {
          setOpen(false);
          setEditing(null);
        }}
      />
    </SectionCard>
  );
}

function PortfolioDialog({
  open,
  onOpenChange,
  initial,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: PortfolioProject | null;
  onSaved: () => void;
}) {
  const upsert = useUpsertPortfolioProject();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [cropOpen, setCropOpen] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(initial?.title ?? "");
    setDescription(initial?.description ?? "");
    setProjectUrl(initial?.project_url ?? "");
    setGithubUrl(initial?.github_url ?? "");
    setImageUrl(initial?.image_url ?? "");
  }, [open, initial]);

  const save = async () => {
    if (!title.trim()) {
      toast.error("Project name is required");
      return;
    }
    try {
      await upsert.mutateAsync({
        id: initial?.id,
        title: title.trim(),
        description,
        project_url: projectUrl || null,
        github_url: githubUrl || null,
        image_url: imageUrl || null,
      });
      toast.success(initial ? "Project updated" : "Project added");
      onSaved();
    } catch (e: any) {
      toast.error("Save failed", { description: e.message });
    }
  };

  const handleImage = async (blob: Blob) => {
    const file = new File([blob], "project.jpg", { type: "image/jpeg" });
    const path = await uploadFile("profileAssets", "portfolio", file);
    setImageUrl(getPublicUrl("profileAssets", path));
    setCropOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto black-tuf-scrollbar">
          <DialogHeader>
            <DialogTitle>{initial ? "Edit Portfolio Project" : "Add Portfolio Project"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Project image</Label>
              <div className="flex items-center gap-3">
                {imageUrl ? (
                  <img src={imageUrl} alt="Project" className="h-20 w-32 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-20 w-32 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground">
                    No image
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="portfolio-image-input"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    if (f) {
                      setCropFile(f);
                      setCropOpen(true);
                    }
                    e.target.value = "";
                  }}
                />
                <label
                  htmlFor="portfolio-image-input"
                  className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-input px-3 text-xs font-medium shadow-sm transition-colors hover:bg-accent"
                >
                  {imageUrl ? "Replace" : "Upload"} image
                </label>
                {imageUrl && (
                  <Button size="sm" variant="ghost" type="button" onClick={() => setImageUrl("")}>
                    Remove
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Project name</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. E-commerce Platform" />
            </div>
            <div className="space-y-2">
              <Label>Short description</Label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Project URL</Label>
                <Input value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} placeholder="https://…" />
              </div>
              <div className="space-y-2">
                <Label>GitHub URL (optional)</Label>
                <Input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://…" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button variant="gradient" onClick={save} disabled={upsert.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ImageCropDialog
        open={cropOpen}
        file={cropFile}
        aspect={16 / 9}
        title="Crop project image"
        onCancel={() => setCropOpen(false)}
        onCrop={handleImage}
      />
    </>
  );
}
