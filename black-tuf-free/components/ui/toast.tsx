"use client";

import { toast as sonnerToast } from "sonner";

export const useToast = () => ({ toast: sonnerToast });

export { sonnerToast as toast };

export type ToastProps = Parameters<typeof sonnerToast.error>[0];
