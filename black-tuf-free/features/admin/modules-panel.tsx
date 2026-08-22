"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Blocks } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useModuleFlags, useSaveModuleFlags } from "@/hooks/use-modules";
import { MODULES, type ModuleKey } from "@/utils/modules";

export function ModulesPanel() {
  const flags = useModuleFlags();
  const save = useSaveModuleFlags();
  const [draft, setDraft] = useState<Record<ModuleKey, boolean> | null>(null);

  const current = draft ?? flags.data;
  const dirty =
    draft != null &&
    flags.data != null &&
    MODULES.some((m) => draft[m.key] !== flags.data![m.key]);

  const toggle = (key: ModuleKey, enabled: boolean) => {
    setDraft((d) => ({
      ...(d ?? (flags.data as Record<ModuleKey, boolean>)),
      [key]: enabled,
    }));
  };

  const submit = async () => {
    if (!draft) return;
    try {
      await save.mutateAsync(draft);
      setDraft(null);
      toast.success("Modules updated");
    } catch (e: any) {
      toast.error("Failed to save", { description: e.message });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Blocks className="h-4 w-4" /> Modules
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Disabling a module hides its menus, disables its routes, removes its
          dashboard widgets and hides its homepage sections.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!current ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {MODULES.map((mod) => (
              <div
                key={mod.key}
                className="flex items-start justify-between gap-3 rounded-xl border border-border/60 p-3"
              >
                <div>
                  <p className="text-sm font-medium">{mod.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{mod.description}</p>
                </div>
                <Switch
                  checked={current[mod.key]}
                  onCheckedChange={(v) => toggle(mod.key, v)}
                />
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end">
          <Button onClick={submit} disabled={save.isPending || !dirty}>
            {save.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
            Save modules
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
