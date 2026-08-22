"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  FileArchive,
  FileImage,
  FileText,
  Link2,
  MapPin,
  Rocket,
  Wallet,
  Plus,
  X,
  Globe,
  CalendarClock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useActiveServices, type ServiceOption } from "@/hooks/use-services";
import { uploadFile } from "@/services/storage";
import { addProjectFile } from "@/services/files";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/components/ui/toast";
import { useDashboardTitle } from "@/components/dashboard/dashboard-context";
import { CURRENCIES, COUNTRIES, type CurrencyMeta, type CountryMeta } from "@/utils/constants";
import { useCountryDetection } from "@/hooks/use-country";

const schema = z
  .object({
    domains: z.array(z.string()).min(1, "Select at least one service domain."),
    name: z.string().min(4, "Give your project a clear title (min 4 characters)."),
    description: z.string().min(20, "Describe your project in at least 20 characters."),
    skills: z.array(z.string()).default([]),
    country_code: z.string().min(1, "Select a country."),
    country_name: z.string().optional(),
    currency_code: z.string().min(1, "Select a currency."),
    currency_symbol: z.string().optional(),
    budget_min: z.coerce.number().min(1, "Set a minimum budget."),
    budget_max: z.coerce.number().min(1, "Set a maximum budget."),
    delivery_date: z.string().min(1, "Choose a delivery date."),
    timezone: z.string().min(1, "Timezone is required."),
    priority: z.enum(["high", "medium", "low"]).default("medium"),
    project_type: z.enum(["online", "on_site"]),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    has_sample: z.boolean(),
    sample_files: z.array(z.instanceof(File)).optional(),
    figma_link: z.string().url("Enter a valid Figma link").optional().or(z.literal("")),
    adobe_link: z.string().url("Enter a valid Adobe link").optional().or(z.literal("")),
  })
  .refine((d) => d.budget_max >= d.budget_min, {
    message: "Maximum budget must be greater than or equal to minimum.",
    path: ["budget_max"],
  });

type FormValues = z.infer<typeof schema>;
const TOTAL_STEPS = 9;

const stepLabels = [
  "Domains",
  "Title",
  "Description",
  "Skills",
  "Budget",
  "Deadline",
  "Project Type",
  "Sample Design",
  "Review",
];

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

export function PostProjectWizard() {
  useDashboardTitle("Post Project", "Create a project for the marketplace");
  const router = useRouter();
  const { user } = useAuth();
  const { services } = useActiveServices();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { country, setCountry, isDetected } = useCountryDetection();

  const minDate = useMemo(() => getTomorrowDate(), []);
  const timezone = useMemo(() => detectTimezone(), []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      domains: ["web"],
      priority: "medium",
      project_type: "online",
      has_sample: false,
      skills: [],
      sample_files: [],
      figma_link: "",
      adobe_link: "",
      country_code: country.code,
      country_name: country.name,
      currency_code: country.currencyCode,
      currency_symbol: country.currencySymbol,
      delivery_date: "",
      timezone,
    },
  });

  // Keep form country/currency in sync when detection resolves or user changes country.
  useEffect(() => {
    setValue("country_code", country.code, { shouldValidate: false });
    setValue("country_name", country.name, { shouldValidate: false });
    setValue("currency_code", country.currencyCode, { shouldValidate: false });
    setValue("currency_symbol", country.currencySymbol, { shouldValidate: false });
  }, [country, setValue]);

  const values = watch();

  const validateStep = async () => {
    switch (step) {
      case 0: return await trigger("domains");
      case 1: return await trigger("name");
      case 2: return await trigger("description");
      case 3: return true;
      case 4: return await trigger(["country_code", "currency_code", "budget_min", "budget_max"]);
      case 5: return await trigger(["delivery_date", "timezone"]);
      case 6: return await trigger(values.project_type === "on_site" ? ["project_type", "address", "city", "state", "pincode"] : ["project_type"]);
      case 7: return await trigger(values.has_sample ? ["has_sample", "figma_link", "adobe_link"] : ["has_sample"]);
      default: return true;
    }
  };

  const goNext = async () => {
    if (!(await validateStep())) return;
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  };

  const onSubmit = async (data: FormValues) => {
    if (!user?.id) return toast.error("You must be signed in.");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          service: data.domains[0],
          domains: data.domains,
          skills: data.skills,
          project_type: data.project_type,
          address: data.project_type === "on_site" ? data.address || null : null,
          city: data.project_type === "on_site" ? data.city || null : null,
          state: data.project_type === "on_site" ? data.state || null : null,
          pincode: data.project_type === "on_site" ? data.pincode || null : null,
          country_code: data.country_code,
          country_name: data.country_name,
          currency_code: data.currency_code,
          currency_symbol: data.currency_symbol,
          budget_min: data.budget_min,
          budget_max: data.budget_max,
          delivery_date: data.delivery_date,
          timezone: data.timezone,
          priority: data.priority,
          description: data.description,
          has_sample: data.has_sample,
          figma_link: data.has_sample ? data.figma_link || null : null,
          adobe_link: data.has_sample ? data.adobe_link || null : null,
        }),
      });

      const json = (await res.json()) as { id?: string; redirectUrl?: string; error?: string };
      if (!res.ok) throw new Error(json.error ?? "Failed to create project");

      const projectId = json.id;

      if (data.has_sample && data.sample_files?.length && projectId) {
        const folder = `projects/${projectId}`;
        for (const file of data.sample_files) {
          try {
            const path = await uploadFile("projectFiles", folder, file);
            await addProjectFile({
              project_id: projectId,
              uploaded_by: user.id,
              name: file.name,
              file_type: file.type || "file",
              size: file.size,
              storage_path: path,
            });
          } catch {
            toast.error(`Could not upload ${file.name}`);
          }
        }
      }

      toast.success("Project published", {
        description: "Your project is now open for proposals from matching engineers.",
      });
      router.replace(`/dashboard/projects/${projectId}`);
    } catch (err: unknown) {
      toast.error("Failed to create project", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="mx-auto max-w-2xl space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold">
            Step {step + 1} of {TOTAL_STEPS} — {stepLabels[step]}
          </span>
          <span className="text-muted-foreground">{Math.round(((step + 1) / TOTAL_STEPS) * 100)}%</span>
        </div>
        <Progress value={((step + 1) / TOTAL_STEPS) * 100} className="h-2" />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {stepLabels.map((label, i) => (
            <span
              key={label}
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[10px] font-medium",
                i === step
                  ? "bg-primary text-primary-foreground"
                  : i < step
                    ? "bg-success/20 text-success"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {i < step ? "✓" : i + 1} {label}
            </span>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-3xl p-6 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -32 }}
            transition={{ duration: 0.22 }}
          >
            {step === 0 && <StepDomains watch={watch} setValue={setValue} errors={errors} services={services} />}
            {step === 1 && <StepTitle register={register} errors={errors} />}
            {step === 2 && <StepDescription register={register} errors={errors} />}
            {step === 3 && <StepSkills setValue={setValue} watch={watch} />}
            {step === 4 && (
              <StepBudget
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
                currency={CURRENCIES.find((c) => c.code === (values.currency_code || "INR")) ?? CURRENCIES[1]}
                country={country}
                isDetected={isDetected}
                onCountryChange={setCountry}
              />
            )}
            {step === 5 && (
              <StepDeadline
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
                minDate={minDate}
              />
            )}
            {step === 6 && <StepType register={register} errors={errors} watch={watch} />}
            {step === 7 && <StepSamples setValue={setValue} watch={watch} errors={errors} />}
            {step === 8 && <StepReview values={getValues()} services={services} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        {step < TOTAL_STEPS - 1 ? (
          <Button type="button" onClick={goNext}>
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" variant="gradient" disabled={isSubmitting}>
            <Rocket className="h-4 w-4" />
            {isSubmitting ? "Publishing…" : "Publish Project"}
          </Button>
        )}
      </div>
    </form>
  );
}

function StepDomains({ watch, setValue, errors, services }: { watch: any; setValue: any; errors: any; services: ServiceOption[] }) {
  const domains = (watch("domains") ?? []) as string[];
  const toggle = (id: string) => {
    const next = domains.includes(id) ? domains.filter((d) => d !== id) : [...domains, id];
    setValue("domains", next, { shouldValidate: true });
  };

  return (
    <div className="space-y-5">
      <StepHeader icon={Rocket} title="Which service domains apply?" subtitle="Select all that apply — matching engineers will be notified." />
      <div className="grid gap-2 sm:grid-cols-2">
        {services.map((s) => {
          const active = domains.includes(s.id);
          return (
            <button
              type="button"
              key={s.id}
              onClick={() => toggle(s.id)}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-2xl border bg-muted/20 p-3.5 text-left transition-all",
                active ? "border-primary bg-primary/10" : "border-border"
              )}
            >
              <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", active ? "bg-primary/20 text-primary" : "bg-primary/15 text-primary")}>
                <s.icon className="h-5 w-5" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold">{s.title}</span>
                <span className="text-xs text-muted-foreground">{s.short}</span>
              </span>
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                  active ? "border-primary bg-primary text-primary-foreground" : "border-border"
                )}
              >
                {active && <Check className="h-3.5 w-3.5" />}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        {domains.length > 0 ? `${domains.length} domain${domains.length === 1 ? "" : "s"} selected.` : "Select at least one domain."}
      </p>
      {errors.domains && <p className="text-sm text-destructive">{errors.domains.message}</p>}
    </div>
  );
}

function StepSkills({ watch, setValue }: { watch: any; setValue: any }) {
  const skills = (watch("skills") ?? []) as string[];
  const [skillInput, setSkillInput] = useState("");

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value) return;
    if (!skills.includes(value)) setValue("skills", [...skills, value], { shouldValidate: true });
    setSkillInput("");
  };

  return (
    <div className="space-y-5">
      <StepHeader icon={Plus} title="Required skills" subtitle="What skills should engineers have for this project?" />

      <div className="space-y-2">
        <Label className="flex items-center gap-1">
          <Plus className="h-3.5 w-3.5" /> Skills
        </Label>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="gap-1 py-1 pr-1">
              {skill}
              <button
                type="button"
                onClick={() => setValue("skills", skills.filter((s) => s !== skill), { shouldValidate: true })}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. React, PostgreSQL, ESP32…"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
          />
          <Button size="sm" variant="secondary" type="button" onClick={addSkill}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Press Enter or click Add to add a skill.</p>
      </div>
    </div>
  );
}

function StepTitle({ register, errors }: { register: any; errors: any }) {
  return (
    <div className="space-y-5">
      <StepHeader icon={FileText} title="Name your project" subtitle="A clear title helps engineers understand it instantly." />
      <div className="space-y-2">
        <Label htmlFor="name">Project title</Label>
        <Input id="name" placeholder="e.g. Real-time IoT monitoring dashboard" className="h-12 text-base" {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
    </div>
  );
}

function StepDescription({ register, errors }: { register: any; errors: any }) {
  return (
    <div className="space-y-5">
      <StepHeader icon={FileText} title="Describe your project" subtitle="Goals, scope, must-haves and any context engineers should know." />
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={6} placeholder="Describe your project in detail…" className="text-base" {...register("description")} />
        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
      </div>
    </div>
  );
}

function StepBudget({
  register,
  errors,
  watch,
  setValue,
  currency,
  country,
  isDetected,
  onCountryChange,
}: {
  register: any;
  errors: any;
  watch: any;
  setValue: any;
  currency: CurrencyMeta;
  country: CountryMeta;
  isDetected: boolean;
  onCountryChange: (code: string) => void;
}) {
  const budgetMin = watch("budget_min");
  const budgetMax = watch("budget_max");

  const formatPreview = (val: number | undefined) => {
    if (!val) return "—";
    return `${currency.symbol}${val.toLocaleString("en-IN")}`;
  };

  return (
    <div className="space-y-5">
      <StepHeader icon={Wallet} title="Set your budget" subtitle="Engineers will price their proposals against this range." />

      <div className="space-y-2">
        <Label htmlFor="country_code" className="flex items-center gap-1.5">
          🌍 Country
          {isDetected && (
            <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success">✓ Detected</span>
          )}
        </Label>
        <Select
          value={watch("country_code") || country.code}
          onValueChange={(code) => {
            const c = COUNTRIES.find((x) => x.code === code);
            if (!c) return;
            onCountryChange(code);
            setValue("country_code", c.code, { shouldValidate: true });
            setValue("country_name", c.name, { shouldValidate: false });
            setValue("currency_code", c.currencyCode, { shouldValidate: true });
            setValue("currency_symbol", c.currencySymbol, { shouldValidate: false });
          }}
        >
          <SelectTrigger id="country_code" className="h-12">
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

      <div className="space-y-2">
        <Label htmlFor="currency_code">Currency</Label>
        <Select
          value={watch("currency_code") || currency.code}
          onValueChange={(v) => setValue("currency_code", v, { shouldValidate: true })}
        >
          <SelectTrigger id="currency_code" className="h-12">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                <span className="flex items-center gap-2">
                  <span className="text-base">{c.flag}</span>
                  <span>{c.code}</span>
                  <span className="text-muted-foreground">— {c.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.currency_code && <p className="text-sm text-destructive">{errors.currency_code.message}</p>}
        <p className="text-xs text-muted-foreground">
          {isDetected
            ? `${currency.symbol} ${currency.label} (Detected from ${country.name})`
            : `${currency.symbol} ${currency.label}`}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="budget_min">Minimum Budget</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{currency.symbol}</span>
            <Input id="budget_min" type="number" min={0} placeholder="100" className="h-12 pl-7 text-base" {...register("budget_min")} />
          </div>
          {errors.budget_min && <p className="text-sm text-destructive">{errors.budget_min.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="budget_max">Maximum Budget</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{currency.symbol}</span>
            <Input id="budget_max" type="number" min={0} placeholder="1000" className="h-12 pl-7 text-base" {...register("budget_max")} />
          </div>
          {errors.budget_max && <p className="text-sm text-destructive">{errors.budget_max.message}</p>}
        </div>
      </div>

      {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}

      <div className="rounded-2xl border border-border bg-muted/20 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Budget Preview</p>
        <p className="mt-1 text-lg font-bold">{formatPreview(budgetMin)} — {formatPreview(budgetMax)}</p>
      </div>
    </div>
  );
}

function StepDeadline({
  register,
  errors,
  watch,
  setValue,
  minDate,
}: {
  register: any;
  errors: any;
  watch: any;
  setValue: any;
  minDate: string;
}) {
  const selectedDate = watch("delivery_date");

  // Validate: date must be >= minDate
  const dateInvalid = selectedDate.length > 0 && selectedDate < minDate;

  return (
    <div className="space-y-5">
      <StepHeader icon={CalendarClock} title="Delivery timeline" subtitle="When does this need to be delivered? Must be at least one day from today." />

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="delivery_date">Delivery Date</Label>
          <Input
            id="delivery_date"
            type="date"
            min={minDate}
            className="h-12 text-base"
            {...register("delivery_date", {
              validate: (v: string) => (v.length > 0 && v < minDate) || "Delivery date must be at least one day from today.",
            })}
          />
          {errors.delivery_date && <p className="text-sm text-destructive">{errors.delivery_date.message}</p>}
          {!errors.delivery_date && dateInvalid && (
            <p className="text-sm text-destructive">Delivery date must be at least one day from today.</p>
          )}
          <p className="text-xs text-muted-foreground">Earliest allowed: {new Date(minDate + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone" className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5" /> Timezone
          </Label>
          <Input id="timezone" className="h-12 text-base" {...register("timezone")} />
          <input type="hidden" {...register("timezone")} />
          <p className="text-xs text-muted-foreground">Auto-detected from your browser. You can change it if needed.</p>
          {errors.timezone && <p className="text-sm text-destructive">{errors.timezone.message}</p>}
        </div>
      </div>
    </div>
  );
}

function StepType({ register, errors, watch }: { register: any; errors: any; watch: any }) {
  const type = watch("project_type");
  return (
    <div className="space-y-5">
      <StepHeader icon={MapPin} title="Project type" subtitle="Will this be delivered remotely or require on-site work?" />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="cursor-pointer rounded-2xl border border-border bg-muted/20 p-5 transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/10">
          <input type="radio" value="online" {...register("project_type")} className="sr-only" />
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <GlobeIcon />
            </span>
            <div>
              <p className="font-semibold">Online</p>
              <p className="text-xs text-muted-foreground">Fully remote. No address needed.</p>
            </div>
          </div>
        </label>
        <label className="cursor-pointer rounded-2xl border border-border bg-muted/20 p-5 transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/10">
          <input type="radio" value="on_site" {...register("project_type")} className="sr-only" />
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <MapPin className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold">On-Site</p>
              <p className="text-xs text-muted-foreground">Engineers may visit your location.</p>
            </div>
          </div>
        </label>
      </div>

      <AnimatePresence>
        {type === "on_site" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" placeholder="Street, building, landmark" {...register("address")} />
              {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="Bengaluru" {...register("city")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" placeholder="Karnataka" {...register("state")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">PIN</Label>
                <Input id="pincode" placeholder="560001" {...register("pincode")} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {errors.project_type && <p className="text-sm text-destructive">{errors.project_type.message}</p>}
    </div>
  );
}

function StepSamples({ setValue, watch, errors }: { setValue: any; watch: any; errors: any }) {
  const hasSample = watch("has_sample");
  const files = (watch("sample_files") ?? []) as File[];
  return (
    <div className="space-y-5">
      <StepHeader icon={FileImage} title="Sample design" subtitle="Do you have reference files to share with engineers?" />

      <div className="flex gap-3">
        {([true, false] as const).map((v) => (
          <button
            key={String(v)}
            type="button"
            onClick={() => setValue("has_sample", v)}
            className={cn(
              "flex-1 rounded-2xl border p-4 text-sm font-semibold transition-all",
              hasSample === v
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-muted/20 text-muted-foreground"
            )}
          >
            {v ? "Yes, I have references" : "No"}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {hasSample && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden"
          >
            <div className="rounded-2xl border border-dashed p-4">
              <Label className="mb-2 block">Reference files (Images, PDF or ZIP)</Label>
              <input
                type="file"
                accept="image/*,application/pdf,application/zip,application/x-zip-compressed"
                multiple
                onChange={(e) => setValue("sample_files", Array.from(e.target.files ?? []))}
                className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary/15 file:px-3 file:py-1.5 file:text-primary"
              />
              {files.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {files.map((f) => {
                    const isImage = f.type.startsWith("image/");
                    const isPdf = f.type === "application/pdf";
                    const Icon = isImage ? FileImage : isPdf ? FileText : FileArchive;
                    return (
                      <li key={f.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Icon className="h-3.5 w-3.5 text-primary" />
                        {f.name} ({(f.size / 1024).toFixed(1)} KB)
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="figma_link" className="flex items-center gap-1.5">
                  <Link2 className="h-3.5 w-3.5" /> Figma URL
                </Label>
                <Input id="figma_link" type="url" placeholder="https://figma.com/file/…" onChange={(e) => setValue("figma_link", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adobe_link" className="flex items-center gap-1.5">
                  <Link2 className="h-3.5 w-3.5" /> Adobe XD URL
                </Label>
                <Input id="adobe_link" type="url" placeholder="https://xd.adobe.com/…" onChange={(e) => setValue("adobe_link", e.target.value)} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {(errors.has_sample || errors.figma_link || errors.adobe_link) && (
        <p className="text-sm text-destructive">
          {errors.has_sample?.message || errors.figma_link?.message || errors.adobe_link?.message}
        </p>
      )}
    </div>
  );
}

function StepReview({ values, services }: { values: FormValues; services: ServiceOption[] }) {
  const titleFor = (id: string) => services.find((s) => s.id === id)?.title ?? id;
  const currency = CURRENCIES.find((c) => c.code === values.currency_code);
  const symbol = currency?.symbol ?? "₹";

  const fmt = (n: number) => `${symbol}${n.toLocaleString("en-IN")}`;
  const fmtDate = (d: string) => {
    if (!d) return "—";
    return new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const rows: { label: string; value: string }[] = [
    { label: "Domains", value: values.domains.map(titleFor).join(", ") },
    { label: "Title", value: values.name },
    { label: "Budget", value: `${fmt(values.budget_min)} — ${fmt(values.budget_max)} ${values.currency_code}` },
    { label: "Country", value: `${values.country_name ?? values.country_code} (${values.currency_code})` },
    { label: "Delivery", value: `${fmtDate(values.delivery_date)} (${values.timezone})` },
    { label: "Priority", value: values.priority },
    { label: "Type", value: values.project_type === "online" ? "Online" : "On-Site" },
  ];
  if (values.skills?.length) {
    rows.push({ label: "Required skills", value: values.skills.join(", ") });
  }
  if (values.project_type === "on_site") {
    rows.push({
      label: "Location",
      value: [values.address, values.city, values.state, values.pincode].filter(Boolean).join(", "),
    });
  }
  rows.push({
    label: "Sample design",
    value: values.has_sample
      ? `${values.sample_files?.length ?? 0} file(s)${values.figma_link ? " · Figma" : ""}${values.adobe_link ? " · Adobe XD" : ""}`
      : "No",
  });

  return (
    <div className="space-y-5">
      <StepHeader icon={Check} title="Review & publish" subtitle="Check everything before publishing to the marketplace." />
      <dl className="divide-y divide-border/60 rounded-2xl border border-border bg-muted/20">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start justify-between gap-4 px-4 py-3">
            <dt className="text-sm text-muted-foreground">{r.label}</dt>
            <dd className="max-w-[60%] text-right text-sm font-medium">{r.value}</dd>
          </div>
        ))}
      </dl>
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</p>
        <p className="text-sm leading-relaxed text-muted-foreground">{values.description}</p>
      </div>
    </div>
  );
}

function StepHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-cyan-500 text-primary-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
