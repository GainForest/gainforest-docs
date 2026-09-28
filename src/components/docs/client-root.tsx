"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import { useHydrateLocal } from "@/lib/stores/local";

/** Client-only roots the whole site needs: URL state, toasts, and restoring
 *  what this browser remembers (checklists, feedback, recent searches). */
export function ClientRoot({ children }: { children: ReactNode }) {
  useHydrateLocal();
  return (
    <NuqsAdapter>
      {children}
      <Toaster position="bottom-center" />
    </NuqsAdapter>
  );
}
