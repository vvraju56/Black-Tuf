"use client";

import { useState } from "react";
import { Pencil, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { SectionCard } from "@/components/profile/sections/section-card";
import { useUpdateProfile } from "@/hooks/use-profile";
import type { Profile } from "@/types";
import { toast } from "sonner";

const MAX_BIO = 500;

export function AboutSection({ profile, editable }: { profile: Profile; editable?: boolean }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(profile.bio ?? "");
  const update = useUpdateProfile();

  const save = async () => {
    if (draft.length > MAX_BIO) {
      toast.error(`About must be ${MAX_BIO} characters or fewer`);
      return;
    }
    try {
      await update.mutateAsync({ bio: draft });
      setOpen(false);
      toast.success("About updated");
    } catch (e: any) {
      toast.error("Save failed", { description: e.message });
    }
  };

  return (
    <SectionCard
      id="about"
      title="About Me"
      description="Professional description"
      icon={UserRound}
      action={
        editable ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setDraft(profile.bio ?? "");
              setOpen(true);
            }}
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
        ) : undefined
      }
    >
      {profile.bio ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{profile.bio}</p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Add a professional description so clients understand your expertise and approach.
        </p>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit About</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="bio">Professional description</Label>
            <textarea
              id="bio"
              rows={8}
              maxLength={MAX_BIO}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="I am a motivated developer focused on building real-world software solutions…"
              className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground">
              {draft.length}/{MAX_BIO} characters — plain text only, no scripts or embedded content.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="gradient" onClick={save} disabled={update.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SectionCard>
  );
}
