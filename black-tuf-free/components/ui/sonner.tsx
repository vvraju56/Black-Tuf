"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      theme="dark"
      className="toaster group"
      richColors
      closeButton
      position="top-right"
    />
  );
}
