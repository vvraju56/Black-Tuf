"use client";

import { useEffect, useState } from "react";
import { Briefcase, Pencil, Plus, Trash2 } from "lucide-react";
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
import { useUpsertExperience, useDeleteExperience } from "@/hooks/use-profile";
import type { ExperienceItem } from "@/types";
import { toast } from "sonner";

function monthYear(value: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(d);
}

export function ExperienceSection({
  items = [],
  editable,
}: {
  items?: ExperienceItem[];
  editable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ExperienceItem | null>(null);
  const remove = useDeleteExperience();

  return (
    <SectionCard
      id="experience"
      title="Experience"
      description="Work history"
      icon={Briefcase}
      action={
        editable ? (
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Add Experience
          </Button>
        ) : undefined
      }
    >
      {items.length === 0 ? (
        <EmptyState message="No experience added yet" hint="Add work history to build trust with clients." />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border border-border/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{item.job_title}</h3>
                  {item.company && <p className="text-sm text-muted-foreground">{item.company}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {monthYear(item.start_date) || "—"} – {item.currently_working ? "Present" : monthYear(item.end_date) || "—"}
                  </p>
                </div>
                {editable && (
                  <div className="flex shrink-0 gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditing(item); setOpen(true); }} aria-label="Edit">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 hover:text-destructive"
                      onClick={() => {
                        if (confirm("Delete this experience?")) remove.mutate(item.id);
                      }}
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
              {item.description && (
                <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/80">{item.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <ExperienceDialog open={open} onOpenChange={setOpen} initial={editing} onSaved={() => setOpen(false)} />
    </SectionCard>
  );
}

function ExperienceDialog({
  open,
  onOpenChange,
  initial,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: ExperienceItem | null;
  onSaved: () => void;
}) {
  const upsert = useUpsertExperience();
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentlyWorking, setCurrentlyWorking] = useState(false);

  useEffect(() => {
    if (!open) return;
    setJobTitle(initial?.job_title ?? "");
    setCompany(initial?.company ?? "");
    setDescription(initial?.description ?? "");
    setStartDate(initial?.start_date ?? "");
    setEndDate(initial?.end_date ?? "");
    setCurrentlyWorking(initial?.currently_working ?? false);
  }, [open, initial]);

  const save = async () => {
    if (!jobTitle.trim()) {
      toast.error("Job title is required");
      return;
    }
    try {
      await upsert.mutateAsync({
        id: initial?.id,
        job_title: jobTitle.trim(),
        company,
        description,
        start_date: startDate || null,
        end_date: currentlyWorking ? null : endDate || null,
        currently_working: currentlyWorking,
      });
      toast.success(initial ? "Experience updated" : "Experience added");
      onSaved();
    } catch (e: any) {
      toast.error("Save failed", { description: e.message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto black-tuf-scrollbar">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Experience" : "Add Experience"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Job title</Label>
              <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Full Stack Developer" />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Start date</Label>
              <Input type="month" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End date</Label>
              <Input type="month" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={currentlyWorking} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={currentlyWorking} onChange={(e) => setCurrentlyWorking(e.target.checked)} className="h-4 w-4 accent-primary" />
            I currently work here
          </label>
          <div className="space-y-2">
            <Label>Short description</Label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="gradient" onClick={save} disabled={upsert.isPending}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
