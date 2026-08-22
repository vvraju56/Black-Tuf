"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyEngineerProfile, useUpsertEngineerProfile, useSetFreelancerDomains } from "@/hooks/use-engineers";
import { useDashboardTitle } from "@/components/dashboard/dashboard-context";
import { toast } from "sonner";
import { Save, Plus, X, Wrench, Clock, IndianRupee, Layers } from "lucide-react";
import { useActiveServices } from "@/hooks/use-services";
import { cn } from "@/lib/utils";

const AVAILABILITY = ["full_time", "part_time", "contract", "busy"] as const;
const AVAILABILITY_LABEL: Record<string, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  busy: "Busy",
};

const LANGUAGES = ["English", "Hindi", "Marathi", "Tamil", "Telugu", "Bengali", "Gujarati", "Kannada"];

export default function EngineerSettingsPage() {
  useDashboardTitle("Skills & Availability", "Configure how clients find you");
  const { data: profile, isLoading } = useMyEngineerProfile();
  const { services } = useActiveServices();
  const upsert = useUpsertEngineerProfile();
  const setDomains = useSetFreelancerDomains();

  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState<string>("");
  const [experience, setExperience] = useState<string>("0");
  const [location, setLocation] = useState("");
  const [availability, setAvailability] = useState<(typeof AVAILABILITY)[number]>("full_time");
  const [isAvailable, setIsAvailable] = useState(true);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [languages, setLanguages] = useState<string[]>(["English"]);
  const [domains, setDomainsState] = useState<string[]>([]);

  useEffect(() => {
    if (!profile) return;
    setTitle(profile.title ?? "");
    setBio(profile.bio ?? "");
    setHourlyRate(profile.hourly_rate != null ? String(profile.hourly_rate) : "");
    setExperience(String(profile.experience_years ?? 0));
    setLocation(profile.location ?? "");
    setAvailability(profile.availability ?? "full_time");
    setIsAvailable(profile.is_available ?? true);
    setSkills(profile.skills ?? []);
    setLanguages(profile.languages?.length ? profile.languages : ["English"]);
    setDomainsState((profile.freelancer_domains ?? []).map((d) => d.domain_id));
  }, [profile]);

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value) return;
    if (!skills.includes(value)) setSkills((prev) => [...prev, value]);
    setSkillInput("");
  };

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) => (prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]));
  };

  const toggleDomain = (id: string) => {
    setDomainsState((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  };

  const save = () => {
    upsert.mutate(
      {
        title,
        bio,
        skills,
        hourly_rate: hourlyRate ? Number(hourlyRate) : null,
        experience_years: Number(experience) || 0,
        location: location || null,
        availability,
        languages,
        is_available: isAvailable,
      },
      {
        onSuccess: () => {
          setDomains.mutate(domains, {
            onSuccess: () => toast.success("Profile updated."),
            onError: (e) => toast.error(e.message ?? "Failed to update service domains."),
          });
        },
        onError: (e) => toast.error(e.message ?? "Failed to update profile."),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="glass-card space-y-6 rounded-2xl p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Professional Title</Label>
          <Input id="title" placeholder="e.g. Structural Engineer" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" placeholder="e.g. Mumbai, MH" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <textarea
          id="bio"
          rows={4}
          placeholder="Describe your expertise…"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="rate" className="flex items-center gap-1">
            <IndianRupee className="h-3.5 w-3.5" /> Hourly Rate (₹)
          </Label>
          <Input id="rate" type="number" min={0} value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="exp" className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> Experience (years)
          </Label>
          <Input id="exp" type="number" min={0} value={experience} onChange={(e) => setExperience(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Availability</Label>
          <select
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            value={availability}
            onChange={(e) => setAvailability(e.target.value as (typeof AVAILABILITY)[number])}
          >
            {AVAILABILITY.map((a) => (
              <option key={a} value={a}>{AVAILABILITY_LABEL[a]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border/60 p-4">
        <div>
          <p className="flex items-center gap-2 font-medium">
            <Wrench className="h-4 w-4 text-primary" /> Available for work
          </p>
          <p className="text-sm text-muted-foreground">Show up in the engineer marketplace and take on new projects.</p>
        </div>
        <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-1">
          <Wrench className="h-3.5 w-3.5" /> Skills
        </Label>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="gap-1 py-1 pr-1">
              {skill}
              <button onClick={() => setSkills((prev) => prev.filter((s) => s !== skill))} className="text-muted-foreground hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add a skill…"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSkill()}
          />
          <Button size="sm" variant="secondary" onClick={addSkill}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-1">
          <Layers className="h-3.5 w-3.5" /> Service Domains
        </Label>
        <p className="text-sm text-muted-foreground">
          Select the domains you serve. You'll be recommended matching projects and notified when new ones are posted.
        </p>
        <div className="flex flex-wrap gap-2">
          {services.map((s) => {
            const active = domains.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleDomain(s.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors",
                  active
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                )}
              >
                <s.icon className="h-3.5 w-3.5" />
                {s.short}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          {domains.length > 0
            ? `${domains.length} domain${domains.length === 1 ? "" : "s"} selected.`
            : "No domains selected yet — you won't get recommendations until you pick at least one."}
        </p>
      </div>

      <div className="space-y-2">
        <Label>Languages</Label>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => toggleLanguage(lang)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                languages.includes(lang)
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end border-t border-border/60 pt-4">
        <Button variant="gradient" onClick={save} disabled={upsert.isPending}>
          <Save className="mr-1 h-4 w-4" /> Save Changes
        </Button>
      </div>
    </div>
  );
}
