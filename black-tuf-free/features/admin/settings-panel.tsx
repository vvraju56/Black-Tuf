"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAdminSettings, useSaveSettings } from "@/hooks/use-admin";
import type { SiteSettings } from "@/services/cms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Settings2 } from "lucide-react";

export function SettingsPanel() {
  const settings = useAdminSettings();
  const save = useSaveSettings();
  const [form, setForm] = useState<SiteSettings>({});

  useEffect(() => {
    if (settings.data) setForm(settings.data);
  }, [settings.data]);

  const set = (key: keyof SiteSettings, value: string | string[]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async () => {
    try {
      await save.mutateAsync(form);
      toast.success("Settings saved");
    } catch (e: any) {
      toast.error("Failed to save", { description: e.message });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Settings2 className="h-4 w-4" /> Site settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {settings.isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="set-company">Company name</Label>
                <Input id="set-company" value={form.company_name ?? ""} onChange={(e) => set("company_name", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="set-tagline">Tagline</Label>
                <Input id="set-tagline" value={form.tagline ?? ""} onChange={(e) => set("tagline", e.target.value)} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="set-email">Contact email</Label>
                <Input id="set-email" type="email" value={form.contact_email ?? ""} onChange={(e) => set("contact_email", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="set-phone">Contact phone</Label>
                <Input id="set-phone" value={form.contact_phone ?? ""} onChange={(e) => set("contact_phone", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="set-address">Address</Label>
              <Input id="set-address" value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="set-announcement">Announcement banner</Label>
              <Textarea id="set-announcement" value={form.announcement ?? ""} onChange={(e) => set("announcement", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="set-socials">Social links (JSON array of {`{label,url}`})</Label>
              <Textarea
                id="set-socials"
                value={JSON.stringify(form.socials ?? [], null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    if (Array.isArray(parsed)) set("socials", parsed);
                  } catch {
                    // keep current until valid JSON
                  }
                }}
                className="min-h-[100px] font-mono text-xs"
              />
            </div>
            <Button onClick={submit} disabled={save.isPending}>
              {save.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
              Save settings
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
