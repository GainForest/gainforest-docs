import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";

import { ClientRoot } from "@/components/docs/client-root";
import { DocsHeader } from "@/components/docs/docs-header";
import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { MotionProvider } from "@/components/docs/motion-provider";
import { SearchPalette } from "@/components/docs/search-palette";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { site } from "@/lib/site";
import { source } from "@/lib/source";

import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.description,
};

/**
 * The shell, lifted from the admin: an L0 rail with the page on an inset L1
 * panel that is its own scroll container, so the header stays put while the
 * page passes beneath it.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ClientRoot>
          <MotionProvider>
          <TooltipProvider delayDuration={200}>
            <SidebarProvider>
              <DocsSidebar tree={source.getPageTree()} />
              <SidebarInset id="main" className="min-w-0 overflow-y-auto">
                <DocsHeader />
                {children}
              </SidebarInset>
              <SearchPalette />
            </SidebarProvider>
          </TooltipProvider>
          </MotionProvider>
          </ClientRoot>
        </ThemeProvider>
      </body>
    </html>
  );
}
