"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Camera, Check, Clock, Mail, MapPin, Pencil, Share2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ImageCropDialog } from "@/components/profile/image-crop";
import { EmailVerificationDialog } from "@/components/profile/email-verification-dialog";
import { uploadFile, getPublicUrl } from "@/services/storage";
import { useUpdateProfile } from "@/hooks/use-profile";
import { useAuth } from "@/hooks/use-auth";
import { initials } from "@/lib/utils";
import type { Profile } from "@/types";
import { toast } from "sonner";

const COUNTRY_FLAGS: Record<string, string> = {
  India: "🇮🇳",
  "United States": "🇺🇸",
  "United Kingdom": "🇬🇧",
  Canada: "🇨🇦",
  Australia: "🇦🇺",
  Germany: "🇩🇪",
  France: "🇫🇷",
  Spain: "🇪🇸",
  Italy: "🇮🇹",
  Netherlands: "🇳🇱",
  Switzerland: "🇨🇭",
  Sweden: "🇸🇪",
  Norway: "🇳🇴",
  Japan: "🇯🇵",
  China: "🇨🇳",
  Singapore: "🇸🇬",
  "United Arab Emirates": "🇦🇪",
  "Saudi Arabia": "🇸🇦",
  Nigeria: "🇳🇬",
  Kenya: "🇰🇪",
  Brazil: "🇧🇷",
  Mexico: "🇲🇽",
};

function countryFlag(country?: string | null) {
  if (!country) return null;
  return COUNTRY_FLAGS[country] ?? "🌐";
}

function currencySymbol(code?: string | null) {
  const symbols: Record<string, string> = {
    USD: "$", INR: "₹", EUR: "€", GBP: "£", CAD: "C$", AUD: "A$",
    JPY: "¥", AED: "د.إ", SAR: "﷼", SGD: "S$", NGN: "₦", KES: "KSh", BRL: "R$",
  };
  return symbols[code ?? "USD"] ?? `${code ?? "USD"} `;
}

function localTime(timezone?: string | null) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      ...(timezone ? { timeZone: timezone } : {}),
    }).format(new Date());
  } catch {
    return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date());
  }
}

function publicProfileUrl(profile: Profile) {
  return `/profile/${profile.username ?? profile.id}`;
}

export function ProfileHeader({ profile }: { profile: Profile }) {
  const { user } = useAuth();
  const router = useRouter();
  const update = useUpdateProfile();
  const [editOpen, setEditOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [coverDialog, setCoverDialog] = useState(false);
  const [avatarDialog, setAvatarDialog] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const isSelf = user?.id === profile.id;
  const verified = profile.verification_badge || false;
  const emailVerified = profile.email_verified || false;
  const online = profile.last_seen_at
    ? Date.now() - new Date(profile.last_seen_at).getTime() < 5 * 60 * 1000
    : false;

  const handleCoverCrop = async (blob: Blob) => {
    const file = new File([blob], "cover.jpg", { type: "image/jpeg" });
    const path = await uploadFile("profileAssets", `users/${profile.id}`, file);
    const url = getPublicUrl("profileAssets", path);
    await update.mutateAsync({ cover_url: url });
    toast.success("Cover photo updated");
    setCoverDialog(false);
  };

  const handleAvatarCrop = async (blob: Blob) => {
    const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
    const path = await uploadFile("profileAssets", `users/${profile.id}`, file);
    const url = getPublicUrl("profileAssets", path);
    await update.mutateAsync({ avatar_url: url });
    toast.success("Avatar updated");
    setAvatarDialog(false);
  };

  const removeCover = async () => {
    await update.mutateAsync({ cover_url: null });
    toast.success("Cover photo removed");
  };

  const removeAvatar = async () => {
    await update.mutateAsync({ avatar_url: null });
    toast.success("Profile photo removed");
  };

  const copyLink = () => {
    const url = `${window.location.origin}${publicProfileUrl(profile)}`;
    navigator.clipboard.writeText(url).then(() => toast.success("Profile link copied"));
  };

  return (
    <section className="glass-card relative overflow-hidden rounded-3xl">
      {/* Cover */}
      <div className="relative h-44 sm:h-56">
        {profile.cover_url ? (
          <img src={profile.cover_url} alt="Cover" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-indigo-600/40 via-violet-600/30 to-cyan-500/30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        {isSelf && (
          <div className="absolute right-4 top-4 flex gap-2">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="cover-input"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                if (f) {
                  setCoverFile(f);
                  setCoverDialog(true);
                }
                e.target.value = "";
              }}
            />
            <label
              htmlFor="cover-input"
              className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-input bg-secondary px-3 text-xs font-medium shadow-sm backdrop-blur transition-colors hover:bg-accent"
            >
              <Camera className="h-4 w-4" />
              {profile.cover_url ? "Replace Cover" : "Upload Cover"}
            </label>
            {profile.cover_url && (
              <Button size="sm" variant="secondary" className="backdrop-blur" onClick={removeCover}>
                Remove
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="relative -mt-14 px-5 pb-5 sm:-mt-16 sm:px-8 sm:pb-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <div className="relative">
              <Avatar className="h-28 w-28 border-4 border-background shadow-xl sm:h-32 sm:w-32">
                <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name ?? "avatar"} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl">
                  {initials(profile.full_name, profile.email)}
                </AvatarFallback>
              </Avatar>
              {isSelf && (
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="avatar-input"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    if (f) {
                      setAvatarFile(f);
                      setAvatarDialog(true);
                    }
                    e.target.value = "";
                  }}
                />
              )}
              {isSelf && profile.avatar_url && (
                <button
                  onClick={removeAvatar}
                  title="Remove profile photo"
                  aria-label="Remove profile photo"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 cursor-pointer rounded-full bg-secondary p-1 text-foreground shadow-lg transition-colors hover:bg-destructive hover:text-destructive-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              {isSelf && (
                <label
                  htmlFor="avatar-input"
                  className="absolute -bottom-1 -right-1 cursor-pointer rounded-full bg-primary p-1.5 text-primary-foreground shadow-lg transition-transform hover:scale-110"
                  aria-label="Change avatar"
                >
                  <Camera className="h-4 w-4" />
                </label>
              )}
            </div>
            <div className="min-w-0 pb-1">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {profile.full_name || "Your Name"}
                </h1>
                {verified && <BadgeCheck className="h-6 w-6 shrink-0 text-cyan-400" />}
                <span
                  className={`inline-flex h-2.5 w-2.5 shrink-0 rounded-full ${online ? "bg-emerald-500" : "bg-zinc-500"}`}
                  title={online ? "Online" : "Offline"}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                @{profile.username || profile.id.slice(0, 8)}
              </p>
              {isSelf && profile.email && (
                <p className="text-sm text-muted-foreground">
                  <Mail className="mr-1 inline h-3.5 w-3.5" />
                  {profile.email}
                </p>
              )}
              {profile.headline && (
                <p className="mt-1 text-sm font-medium text-foreground/90 sm:text-base">
                  {profile.headline}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {profile.country && (
                  <span className="inline-flex items-center gap-1.5">
                    <span>{countryFlag(profile.country)}</span>
                    {profile.country}
                    {profile.city ? ` · ${profile.city}` : ""}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {localTime(profile.timezone)}
                </span>
                {profile.hourly_rate != null && profile.hourly_rate > 0 && (
                  <span className="inline-flex items-center gap-1 font-semibold text-primary">
                    {currencySymbol(profile.hourly_currency)}{profile.hourly_rate} / hour
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {profile.available_for_work ? (
              <Badge variant="outline" className="gap-1 border-emerald-500/40 bg-emerald-500/10 text-emerald-500">
                <Check className="h-3 w-3" /> Available for Work
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 border-muted-foreground/40 text-muted-foreground">
                Not Available
              </Badge>
            )}
            {isSelf && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const enabling = !profile.available_for_work;
                  if (enabling && !emailVerified) {
                    setVerifyOpen(true);
                    return;
                  }
                  update.mutate(
                    { available_for_work: enabling },
                    {
                      onSuccess: () =>
                        toast.success(enabling ? "Marked as available for work" : "Marked as not available"),
                      onError: (e) => toast.error(e.message ?? "Failed to update availability"),
                    }
                  );
                }}
              >
                Toggle
              </Button>
            )}
          </div>
        </div>

        {isSelf && (
          <div className="mt-5 flex flex-wrap gap-2 border-t border-border/60 pt-4">
            <Button size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" /> Edit Profile
            </Button>
            <Button size="sm" variant="outline" onClick={() => router.push(publicProfileUrl(profile))}>
              View Public Profile
            </Button>
            <Button size="sm" variant="outline" onClick={copyLink}>
              <Share2 className="h-4 w-4" /> Share
            </Button>
          </div>
        )}
      </div>

      <ImageCropDialog
        open={coverDialog}
        file={coverFile}
        aspect={16 / 9}
        title="Crop cover photo"
        onCancel={() => setCoverDialog(false)}
        onCrop={handleCoverCrop}
      />
      <ImageCropDialog
        open={avatarDialog}
        file={avatarFile}
        aspect={1}
        minWidth={256}
        title="Crop profile avatar"
        onCancel={() => setAvatarDialog(false)}
        onCrop={handleAvatarCrop}
      />

      {isSelf && (
        <EditProfileDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          profile={profile}
          onSaved={() => {
            setEditOpen(false);
            toast.success("Profile updated");
          }}
        />
      )}

      <EmailVerificationDialog
        open={verifyOpen}
        onOpenChange={setVerifyOpen}
        onVerified={() => {
          setVerifyOpen(false);
          router.refresh();
        }}
      />
    </section>
  );
}

const COUNTRY_CURRENCIES: Record<string, string> = {
  India: "INR",
  "United States": "USD",
  "United Kingdom": "GBP",
  Canada: "CAD",
  Australia: "AUD",
  Germany: "EUR",
  France: "EUR",
  Spain: "EUR",
  Italy: "EUR",
  Netherlands: "EUR",
  Japan: "JPY",
  China: "CNY",
  Singapore: "SGD",
  "United Arab Emirates": "AED",
  "Saudi Arabia": "SAR",
  Nigeria: "NGN",
  Kenya: "KES",
  Brazil: "BRL",
  Mexico: "MXN",
  Switzerland: "CHF",
  Sweden: "SEK",
  Norway: "NOK",
};

function EditProfileDialog({
  open,
  onOpenChange,
  profile,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  profile: Profile;
  onSaved: () => void;
}) {
  const update = useUpdateProfile();
  const [name, setName] = useState(profile.full_name ?? "");
  const [username, setUsername] = useState(profile.username ?? "");
  const [headline, setHeadline] = useState(profile.headline ?? "");
  const [country, setCountry] = useState(profile.country ?? "");
  const [city, setCity] = useState(profile.city ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [rate, setRate] = useState(profile.hourly_rate != null ? String(profile.hourly_rate) : "");
  const [currency, setCurrency] = useState(profile.hourly_currency ?? "USD");
  const [available, setAvailable] = useState(profile.available_for_work ?? true);
  const [timezone, setTimezone] = useState(profile.timezone ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(profile.full_name ?? "");
    setUsername(profile.username ?? "");
    setHeadline(profile.headline ?? "");
    setCountry(profile.country ?? "");
    setCity(profile.city ?? "");
    setPhone(profile.phone ?? "");
    setRate(profile.hourly_rate != null ? String(profile.hourly_rate) : "");
    setCurrency(profile.hourly_currency ?? "USD");
    setAvailable(profile.available_for_work ?? true);
    setTimezone(profile.timezone ?? "");
  }, [open, profile]);

  const save = async () => {
    setSaving(true);
    try {
      if (available && !profile.email_verified) {
        toast.error("Email verification is required before you can mark yourself as available for work.");
        setSaving(false);
        return;
      }
      await update.mutateAsync({
        full_name: name,
        username: username.trim() || null,
        headline,
        country: country || null,
        city: city || null,
        phone: phone || null,
        hourly_rate: rate ? Number(rate) : null,
        hourly_currency: currency,
        available_for_work: available,
        timezone: timezone || null,
      });
      onSaved();
    } catch (e: any) {
      toast.error("Save failed", { description: e.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto black-tuf-scrollbar">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Full name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Username</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="yourname" />
          </div>
          <div className="space-y-2">
            <Label>Professional headline</Label>
            <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. Full Stack Developer | Node.js, Python & Mobile" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Country</Label>
              <Input
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  const auto = COUNTRY_CURRENCIES[e.target.value.trim()];
                  if (auto) setCurrency(auto);
                }}
                placeholder="India"
              />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Mumbai" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Phone (only you see this)</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Hourly rate</Label>
              <Input type="number" min={0} value={rate} onChange={(e) => setRate(e.target.value)} placeholder="2" />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="AUD">AUD (A$)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="AED">AED (د.إ)</option>
                <option value="SAR">SAR (﷼)</option>
                <option value="SGD">SGD (S$)</option>
                <option value="NGN">NGN (₦)</option>
                <option value="KES">KES (KSh)</option>
                <option value="BRL">BRL (R$)</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Input value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="Asia/Kolkata" />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
            <div>
              <p className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="h-4 w-4 text-primary" /> Available for work
              </p>
              <p className="text-xs text-muted-foreground">Let clients know you're taking on new work.</p>
            </div>
            <Switch checked={available} onCheckedChange={setAvailable} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="gradient" onClick={save} disabled={saving}>
            <Check className="mr-1 h-4 w-4" /> Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
