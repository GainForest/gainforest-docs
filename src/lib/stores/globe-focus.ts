"use client";

import { create } from "zustand";

import type { GlobeOrg } from "@/lib/upstream/globe";

/**
 * The organization the welcome page's globe is turned to. The roster strip
 * under the hero sets it on hover or focus and the globe flies to it; the two
 * live in different parts of the tree, so the link between them is a store,
 * not a prop threaded through the page. Nothing is persisted.
 */
type GlobeFocus = {
  focus: GlobeOrg | null;
  setFocus: (org: GlobeOrg | null) => void;
};

export const useGlobeFocus = create<GlobeFocus>()((set) => ({
  focus: null,
  setFocus: (focus) => set({ focus }),
}));
