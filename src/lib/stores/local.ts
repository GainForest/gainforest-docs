"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * Everything the docs remember for a reader, in this browser only: checklist
 * ticks, feedback already given, recent and chosen searches, reading mode.
 * No account, no server. `skipHydration` so the server render and the first client render
 * agree; `useHydrateLocal` restores it after mount.
 */
type LocalState = {
  checks: Record<string, number[]>;
  toggleCheck: (list: string, index: number) => void;
  resetChecks: (list: string) => void;
  feedback: Record<string, "up" | "down">;
  setFeedback: (page: string, vote: "up" | "down") => void;
  recentSearches: string[];
  pushRecentSearch: (q: string) => void;
  picks: Record<string, number>;
  pick: (url: string) => void;
  reading: boolean;
  setReading: (on: boolean) => void;
};

export const useLocal = create<LocalState>()(
  persist(
    (set) => ({
      checks: {},
      toggleCheck: (list, index) =>
        set((s) => {
          const cur = new Set(s.checks[list] ?? []);
          if (cur.has(index)) cur.delete(index);
          else cur.add(index);
          return { checks: { ...s.checks, [list]: [...cur] } };
        }),
      resetChecks: (list) => set((s) => ({ checks: { ...s.checks, [list]: [] } })),
      feedback: {},
      setFeedback: (page, vote) => set((s) => ({ feedback: { ...s.feedback, [page]: vote } })),
      recentSearches: [],
      pushRecentSearch: (q) =>
        set((s) => {
          const t = q.trim();
          if (t.length < 2) return s;
          return { recentSearches: [t, ...s.recentSearches.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 5) };
        }),
      picks: {},
      pick: (url) => set((s) => ({ picks: { ...s.picks, [url]: (s.picks[url] ?? 0) + 1 } })),
      reading: false,
      setReading: (reading) => set({ reading }),
    }),
    { name: "gf-docs", storage: createJSONStorage(() => localStorage), skipHydration: true },
  ),
);

export function useHydrateLocal() {
  useEffect(() => {
    void useLocal.persist.rehydrate();
  }, []);
}
