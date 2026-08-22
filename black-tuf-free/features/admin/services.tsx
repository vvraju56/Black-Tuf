"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAdminServices, useServiceMutations } from "@/hooks/use-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, Loader2, Power, Layers } from "lucide-react";
import type { Service } from "@/types";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ServicesPanel() {
  const services = useAdminServices();
  const [editing, setEditing] = useState<Service | "new" | null>(null);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Services ({services.data?.length ?? 0})</CardTitle>
        <Button size="sm" onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4 mr-1" /> Add Service
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {editing ? (
          <ServiceForm
            initial={editing === "new" ? undefined : editing}
            onDone={() => setEditing(null)}
          />
        ) : null}

        {services.isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (services.data ?? []).length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <Layers className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No services yet. Add your first service to build the catalogue.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {(services.data ?? []).map((s) => (
              <ServiceCard key={s.id} service={s} onEdit={() => setEditing(s)} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ServiceCard({ service, onEdit }: { service: Service; onEdit: () => void }) {
  const { update, remove } = useServiceMutations();
  const [busy, setBusy] = useState(false);

  const toggleActive = async () => {
    setBusy(true);
    try {
      await update(service.id, { is_active: !service.is_active });
      toast.success(service.is_active ? "Service disabled" : "Service enabled");
    } catch (e: any) {
      toast.error("Update failed", { description: e.message });
    } finally {
      setBusy(false);
    }
  };

  const removeService = async () => {
    if (!confirm(`Delete "${service.name}"?`)) return;
    setBusy(true);
    try {
      await remove(service.id);
      toast.success("Service deleted");
    } catch (e: any) {
      toast.error("Delete failed", { description: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center gap-3">
        {service.image_url ? (
          <img
            src={service.image_url}
            alt={service.name}
            className="h-10 w-10 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
            <Layers className="h-5 w-5 text-primary" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">{service.name}</p>
            {!service.is_active && <Badge variant="outline">Disabled</Badge>}
          </div>
          {service.price ? (
            <p className="text-xs text-muted-foreground">{service.price}</p>
          ) : (
            <p className="text-xs text-muted-foreground">Pricing on request</p>
          )}
        </div>
      </div>
      {service.description ? (
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{service.description}</p>
      ) : null}
      <div className="mt-3 flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={toggleActive} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />}
          {service.is_active ? "Disable" : "Enable"}
        </Button>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil className="h-4 w-4" /> Edit
        </Button>
        <Button variant="ghost" size="sm" className="text-destructive" onClick={removeService} disabled={busy}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function ServiceForm({
  initial,
  onDone,
}: {
  initial?: Service;
  onDone: () => void;
}) {
  const { create, update } = useServiceMutations();
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [price, setPrice] = useState(initial?.price ?? "");
  const [sortOrder, setSortOrder] = useState(initial?.sort_order ?? 0);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) {
      toast.error("Service name is required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        slug: slug || slugify(name),
        description,
        image_url: imageUrl || null,
        price: price || null,
        sort_order: sortOrder,
        is_active: initial?.is_active ?? true,
      };
      if (initial) await update(initial.id, payload);
      else await create(payload);
      toast.success(initial ? "Service updated" : "Service created");
      onDone();
    } catch (e: any) {
      toast.error("Failed to save", { description: e.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border bg-muted/20 p-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="svc-name">Service name</Label>
          <Input
            id="svc-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!initial || slug === slugify(initial.name)) setSlug(slugify(e.target.value));
            }}
            placeholder="e.g. Web Development"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="svc-slug">Slug</Label>
          <Input id="svc-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="web-development" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="svc-desc">Description</Label>
        <Textarea
          id="svc-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="What does this service include?"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="svc-price">Pricing (optional)</Label>
          <Input
            id="svc-price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. From ₹50,000"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="svc-image">Service image URL</Label>
          <Input id="svc-image" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="svc-order">Sort order</Label>
          <Input
            id="svc-order"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
          {initial ? "Save changes" : "Create service"}
        </Button>
        <Button variant="outline" onClick={onDone}>Cancel</Button>
      </div>
    </div>
  );
}
