import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

export function ButtonLink({
  href,
  variant = "primary",
  children,
}: {
  href: string;
  variant?: string;
  children: ReactNode;
}) {
  const external = href.startsWith("http");
  return (
    <span className="not-prose my-4 inline-flex">
      <Button asChild size="lg" variant={variant === "primary" ? "default" : "secondary"}>
        <a href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
          {children}
          {external ? <ArrowUpRight aria-hidden data-icon="inline-end" /> : null}
        </a>
      </Button>
    </span>
  );
}
