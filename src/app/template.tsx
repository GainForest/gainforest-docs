import { PageMotion } from "@/components/docs/page-motion";

/**
 * A template, not a layout: it remounts on every navigation, which is what
 * replays the page's entrance (`.page-enter` in globals.css) while the shell
 * around it, sidebar and header, stays put and does not flicker.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageMotion>{children}</PageMotion>;
}
