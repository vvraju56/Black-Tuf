"use client";

import { useAuth } from "@/hooks/use-auth";
import { getProfile, updateProfile, changePassword } from "@/services/profile";
import { uploadFile, getPublicUrl } from "@/services/storage";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import type { Profile } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Lock, Save, Upload } from "lucide-react";
import { initials } from "@/lib/utils";
import { useDashboardTitle } from "@/components/dashboard/dashboard-context";

export default function ProfilePage() {
  useDashboardTitle("Profile");
  const { user, profile: sessionProfile } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id ?? ""],
    queryFn: () => getProfile(user!.id),
    enabled: !!user,
    initialData: sessionProfile ?? undefined,
  });

  if (!user) return null;
  if (isLoading && !profile) return <Skeleton className="h-64 w-full" />;
  if (!profile) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AvatarForm profile={profile} />
          <ProfileForm profile={profile} onSaved={() => queryClient.invalidateQueries({ queryKey: ["profile", user.id] })} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}

function AvatarForm({ profile }: { profile: Profile }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const userId = profile.id;
  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-20 w-20">
        <AvatarImage src={profile.avatar_url ?? undefined} />
        <AvatarFallback>{initials(profile.full_name, profile.email)}</AvatarFallback>
      </Avatar>
      <div>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          id="avatar"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <label
          htmlFor="avatar"
          className="inline-flex items-center gap-2 cursor-pointer rounded-md border border-input px-3 py-1.5 text-sm"
        >
          <Upload className="h-4 w-4" />
          Choose image
        </label>
        <Button
          size="sm"
          disabled={!file || uploading}
          onClick={async () => {
            if (!file) return;
            try {
              setUploading(true);
              const path = await uploadFile("avatars", `users/${userId}`, file);
              const url = getPublicUrl("avatars", path);
              await updateProfile(userId, { avatar_url: url });
              setFile(null);
              toast.success("Avatar updated");
            } catch (e: any) {
              toast.error("Upload failed", { description: e.message });
            } finally {
              setUploading(false);
            }
          }}
        >
          {uploading ? "Uploading…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

function ProfileForm({ profile, onSaved }: { profile: Profile; onSaved: () => void }) {
  const [name, setName] = useState(profile.full_name ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        updateProfile(profile.id, { full_name: name, phone: phone || null })
          .then(() => {
            toast.success("Profile saved");
            onSaved();
          })
          .catch((err: Error) => toast.error("Save failed", { description: err.message }));
      }}
      className="grid gap-3"
    >
      <div>
        <Label>Full name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <Label>Email</Label>
        <Input type="email" value={profile.email ?? ""} readOnly />
      </div>
      <div>
        <Label>Phone</Label>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <Button type="submit" className="w-fit">
        <Save className="h-4 w-4 mr-1" />
        Save
      </Button>
    </form>
  );
}

function ChangePasswordForm() {
  const { user } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (next.length < 8) {
          toast.error("Password must be at least 8 characters");
          return;
        }
        setSaving(true);
        changePassword(next)
          .then(() => {
            toast.success("Password updated; please re-authenticate if needed");
            setCurrent("");
            setNext("");
          })
          .catch(() => toast.error("Password change failed"))
          .finally(() => setSaving(false));
      }}
      className="grid gap-3"
    >
      <div>
        <Label>Current password (server will validate)</Label>
        <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
      </div>
      <div>
        <Label>New password</Label>
        <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} />
      </div>
      <Button type="submit" disabled={saving || next.length < 8} className="w-fit">
        <Lock className="h-4 w-4 mr-1" />
        {saving ? "Saving…" : "Change password"}
      </Button>
    </form>
  );
}
