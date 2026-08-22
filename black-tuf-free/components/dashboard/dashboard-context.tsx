"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface DashboardTitle {
  title: string;
  subtitle?: string;
}

interface DashboardTitleContextType extends DashboardTitle {
  setTitle: (title: string, subtitle?: string) => void;
}

const DashboardTitleContext = createContext<DashboardTitleContextType | undefined>(
  undefined
);

export function DashboardTitleProvider({ children }: { children: React.ReactNode }) {
  const [title, setTitleState] = useState("Dashboard");
  const [subtitle, setSubtitle] = useState<string | undefined>(undefined);
  const setTitle = (t: string, s?: string) => {
    setTitleState(t);
    setSubtitle(s);
  };
  return (
    <DashboardTitleContext.Provider value={{ title, subtitle, setTitle }}>
      {children}
    </DashboardTitleContext.Provider>
  );
}

export function useDashboardTitle(title: string, subtitle?: string) {
  const ctx = useContext(DashboardTitleContext);
  useEffect(() => {
    if (ctx) {
      ctx.setTitle(title, subtitle);
    }
  }, [ctx, title, subtitle]);
  return ctx;
}

export function useDashboardTitleValue() {
  const ctx = useContext(DashboardTitleContext);
  if (!ctx) throw new Error("useDashboardTitleValue must be used within DashboardTitleProvider");
  return ctx;
}
