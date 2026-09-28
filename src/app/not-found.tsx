import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-[72ch] flex-col items-start gap-3 px-4 py-24 md:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">This page moved or never existed</h1>
      <p className="text-muted-foreground">Search with ⌘K, or start again from the welcome page.</p>
      <Button asChild size="lg">
        <Link href="/">Go to the welcome page</Link>
      </Button>
    </div>
  );
}
