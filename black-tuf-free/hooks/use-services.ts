"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Globe,
  Smartphone,
  Palette,
  Gamepad2,
  Brain,
  Activity,
  Cpu,
  Zap,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { getActiveServices } from "@/services/services";
import { SERVICES } from "@/utils/constants";
import type { Service } from "@/types";

export interface ServiceOption {
  id: string;
  title: string;
  short: string;
  description: string;
  icon: LucideIcon;
}

export const SERVICE_ICON_NAMES: Record<string, LucideIcon> = {
  Globe,
  Smartphone,
  Palette,
  Gamepad2,
  Brain,
  Activity,
  Cpu,
  Zap,
  Layers,
};

export function serviceIcon(name?: string | null): LucideIcon {
  return SERVICE_ICON_NAMES[name ?? ""] ?? Layers;
}

export function toServiceOption(service: Service): ServiceOption {
  return {
    id: service.slug,
    title: service.name,
    short: service.slug,
    description: service.description || "",
    icon: serviceIcon(service.icon),
  };
}

export const STATIC_SERVICE_OPTIONS: ServiceOption[] = SERVICES.map((s) => ({
  id: s.id,
  title: s.title,
  short: s.short,
  description: s.description,
  icon: s.icon as LucideIcon,
}));

/**
 * Active services from the DB catalogue, falling back to the static list
 * when the table is empty or unreachable (e.g. migration not applied).
 * Disabled services never appear — this is the single source for all
 * service pickers, landing sections and the nav mega menu.
 */
export function useActiveServices(): {
  services: ServiceOption[];
  isLoading: boolean;
} {
  const { data, isLoading } = useQuery({
    queryKey: ["services", "active"] as const,
    queryFn: getActiveServices,
    staleTime: 60_000,
  });

  if (isLoading) return { services: [], isLoading };
  const active = (data ?? []).filter((s) => s.is_active);
  return {
    services: active.length ? active.map(toServiceOption) : STATIC_SERVICE_OPTIONS,
    isLoading: false,
  };
}
