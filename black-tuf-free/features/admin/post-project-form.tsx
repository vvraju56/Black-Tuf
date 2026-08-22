"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, X, Send, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAdminUsers } from "@/hooks/use-admin";
import { useActiveServices } from "@/hooks/use-services";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCIES, COUNTRIES } from "@/utils/constants";
import { useCountryDetection } from "@/hooks/use-country";

const projectSchema = z.object({
  client_id: z.string().min(1, "Select a client"),
  domains: z.array(z.string()).min(1, "Select at least one domain"),
  name: z.string().min(2, "Project name is required"),
  project_type: z.enum(["online", "on_site"]),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  currency_code: z.string().min(1, "Select a currency"),
  budget_min: z.coerce.number().min(1, "Set a minimum budget"),
  budget_max: z.coerce.number().min(1, "Set a maximum budget"),
  delivery_date: z.string().min(1, "Choose a delivery date"),
  timezone: z.string().min(1, "Timezone is required"),
  priority: z.enum(["high", "medium", "low"]),
  engineer_id: z.string().optional(),
  has_sample: z.boolean().optional(),
  figma_link: z.string().url("Enter a valid Figma link").optional().or(z.literal("")),
  description: z.string().min(5, "Description is required"),
  country_code: z.string().min(1, "Select a country"),
  country_name: z.string().optional(),
  currency_symbol: z.string().optional(),
});

type ProjectValues = z.infer<typeof projectSchema>;

function getTomorrowDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function PostProjectForm({ onDone }: { onDone?: () => void }) {
  const clients = useAdminUsers();
  const { services } = useActiveServices();
  const [saving, setSaving] = useState(false);
  const { country, setCountry } = useCountryDetection();
  const minDate = useMemo(() => getTomorrowDate(), []);
  const timezone = useMemo(() => detectTimezone(), []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectValues>({
    resolver: zodResolver(projectSchema) as Resolver<ProjectValues>,
    defaultValues: {
      domains: [],
      project_type: "online",
      priority: "medium",
      has_sample: false,
      engineer_id: "",
      figma_link: "",
      currency_code: country.currencyCode,
      country_code: country.code,
      country_name: country.name,
      currency_symbol: country.currencySymbol,
      delivery_date: "",
      timezone,
    },
  });

  const projectType = watch("project_type");
  const hasSample = watch("has_sample");
  const domains = (watch("domains") ?? []) as string[];
  const selectedDate = watch("delivery_date");
  const isMinDate = selectedDate === minDate;

  const clientOptions = (clients.data ?? []).filter((u) => u.role === "client");
  const engineerOptions = (clients.data ?? []).filter((u) => u.role === "engineer");

  const toggleDomain = (id: string) => {
    const next = domains.includes(id)
      ? domains.filter((d) => d !== id)
      : [...domains, id];
    setValue("domains", next, { shouldValidate: true });
  };

  // Keep country/currency in sync when detection resolves or user changes country.
  useEffect(() => {
    setValue("country_code", country.code, { shouldValidate: false });
    setValue("country_name", country.name, { shouldValidate: false });
    setValue("currency_code", country.currencyCode, { shouldValidate: false });
    setValue("currency_symbol", country.currencySymbol, { shouldValidate: false });
  }, [country, setValue]);

  const onSubmit = async (values: ProjectValues) => {
    setSaving(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: values.client_id,
          name: values.name,
          service: values.domains[0],
          domains: values.domains,
          skills: [],
          project_type: values.project_type,
          address: values.project_type === "on_site" ? values.address || null : null,
          city: values.project_type === "on_site" ? values.city || null : null,
          state: values.project_type === "on_site" ? values.state || null : null,
          pincode: values.project_type === "on_site" ? values.pincode || null : null,
          country_code: values.country_code,
          country_name: values.country_name,
          currency_code: values.currency_code,
          currency_symbol: values.currency_symbol,
          budget_min: values.budget_min,
          budget_max: values.budget_max,
          delivery_date: values.delivery_date,
          timezone: values.timezone,
          priority: values.priority,
          description: values.description,
          has_sample: values.has_sample ?? false,
          figma_link: values.has_sample ? values.figma_link || null : null,
          adobe_link: null,
        }),
      });

      const json = (await res.json()) as { id?: string; redirectUrl?: string; error?: string };
      if (!res.ok) throw new Error(json.error ?? "Failed to post project");

      toast.success("Project posted", {
        description: "Matching engineers have been notified.",
      });
      onDone?.();
      if (typeof window !== "undefined") {
        window.location.href = `/dashboard/projects/${json.id}`;
      }
    } catch (e: any) {
      toast.error("Failed to post project", { description: e.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Post Project</h3>
        {onDone ? (
          <Button variant="ghost" size="icon" onClick={onDone}>
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="pp-client">Client *</Label>
          <select
            id="pp-client"
            {...register("client_id")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Select client…</option>
            {clientOptions.map((c) => (
              <option key={c.id} value={c.id}>{c.full_name || c.email}</option>
            ))}
          </select>
          {errors.client_id && <p className="text-xs text-destructive">{errors.client_id.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pp-service">Service Domains *</Label>
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
                  {s.title}
                  {active && <X className="h-3 w-3" />}
                </button>
              );
            })}
          </div>
          {errors.domains && <p className="text-xs text-destructive">{errors.domains.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pp-name">Project name *</Label>
        <Input id="pp-name" {...register("name")} placeholder="e.g. CRM Management System" />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Project type</Label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" value="online" {...register("project_type")} />
            Online
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" value="on_site" {...register("project_type")} />
            On-Site
          </label>
        </div>
      </div>

      {projectType === "on_site" && (
        <div className="grid gap-4 rounded-lg bg-muted/30 p-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="pp-address">Address</Label>
            <Input id="pp-address" {...register("address")} placeholder="Full address" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pp-city">City</Label>
            <Input id="pp-city" {...register("city")} placeholder="City" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pp-state">State</Label>
            <Input id="pp-state" {...register("state")} placeholder="State" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pp-pincode">Pincode</Label>
            <Input id="pp-pincode" {...register("pincode")} placeholder="Pincode" />
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Sample design</Label>
        <p className="text-xs text-muted-foreground">Do you have a reference design?</p>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={hasSample === true}
              onChange={() => setValue("has_sample", true)}
            />
            Yes
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={hasSample === false}
              onChange={() => setValue("has_sample", false)}
            />
            No
          </label>
        </div>
      </div>

      {hasSample && (
        <div className="space-y-3 rounded-lg bg-muted/30 p-4">
          <p className="text-xs text-muted-foreground">
            Sample files (images / PDF / ZIP) can be uploaded after the project is created. You can also add a Figma link:
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="pp-figma">Figma URL</Label>
            <Input id="pp-figma" {...register("figma_link")} placeholder="https://figma.com/file/..." />
            {errors.figma_link && <p className="text-xs text-destructive">{errors.figma_link.message}</p>}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="pp-country" className="flex items-center gap-1.5">
          🌍 Country
          <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success">✓ Detected</span>
        </Label>
        <Select
          value={watch("country_code") || country.code}
          onValueChange={(code) => {
            const c = COUNTRIES.find((x) => x.code === code);
            if (!c) return;
            setCountry(code);
            setValue("country_code", c.code, { shouldValidate: true });
            setValue("country_name", c.name, { shouldValidate: false });
            setValue("currency_code", c.currencyCode, { shouldValidate: true });
            setValue("currency_symbol", c.currencySymbol, { shouldValidate: false });
          }}
        >
          <SelectTrigger id="pp-country">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                <span className="flex items-center gap-2">
                  <span className="text-base">{c.flag}</span>
                  <span>{c.name}</span>
                  <span className="text-muted-foreground">— {c.currencyCode}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" {...register("country_code")} />
        <input type="hidden" {...register("country_name")} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pp-currency">Currency *</Label>
        <Select
          value={watch("currency_code") || "INR"}
          onValueChange={(v) => setValue("currency_code", v, { shouldValidate: true })}
        >
          <SelectTrigger id="pp-currency">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                <span className="flex items-center gap-2">
                  <span>{c.flag}</span>
                  <span>{c.code}</span>
                  <span className="text-muted-foreground">— {c.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.currency_code && <p className="text-xs text-destructive">{errors.currency_code.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="pp-budget-min">Minimum Budget *</Label>
          <Input id="pp-budget-min" type="number" min={0} {...register("budget_min")} placeholder="e.g. 50000" />
          {errors.budget_min && <p className="text-xs text-destructive">{errors.budget_min.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pp-budget-max">Maximum Budget *</Label>
          <Input id="pp-budget-max" type="number" min={0} {...register("budget_max")} placeholder="e.g. 100000" />
          {errors.budget_max && <p className="text-xs text-destructive">{errors.budget_max.message}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="pp-deadline">Delivery Date *</Label>
          <Input
            id="pp-deadline"
            type="date"
            min={minDate}
            {...register("delivery_date", {
              validate: (v) => (v && v < minDate) || "Delivery date must be at least one day from today.",
            })}
          />
          {errors.delivery_date && <p className="text-xs text-destructive">{errors.delivery_date.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pp-priority">Priority</Label>
          <select
            id="pp-priority"
            {...register("priority")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pp-timezone" className="flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5" /> Timezone
        </Label>
        <Input id="pp-timezone" {...register("timezone")} />
        <p className="text-xs text-muted-foreground">Auto-detected from browser.</p>
        {errors.timezone && <p className="text-xs text-destructive">{errors.timezone.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pp-engineer">Assign engineer</Label>
        <select
          id="pp-engineer"
          {...register("engineer_id")}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Select engineer…</option>
          {engineerOptions.map((e) => (
            <option key={e.id} value={e.id}>{e.full_name || e.email}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pp-desc">Project details *</Label>
        <Textarea
          id="pp-desc"
          {...register("description")}
          rows={4}
          placeholder="Scope, requirements, deliverables…"
        />
        {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
          Create Project
        </Button>
      </div>
    </form>
  );
}
