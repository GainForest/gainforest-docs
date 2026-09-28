"use client";

import { Expand } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { styleVars } from "@/lib/css-vars";

/**
 * An image with an optional caption, in an L2 frame so a white screenshot
 * still has an edge. Click to enlarge: the dialog grows out of the image
 * (its transform-origin is set to where the image sat), not out of the
 * centre of the screen, so the eye follows it.
 */
export function Figure({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  return (
    <figure className="not-prose my-6 flex flex-col gap-2">
      <Button
        variant="ghost"
        aria-label={`Enlarge image: ${alt}`}
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setOrigin({ x: r.left + r.width / 2 - window.innerWidth / 2, y: r.top + r.height / 2 - window.innerHeight / 2 });
          setOpen(true);
        }}
        className="group relative h-auto w-full cursor-zoom-in overflow-hidden rounded-xl bg-card p-1 hover:bg-card"
      >
        <Image
          src={src}
          alt={alt}
          width={1600}
          height={1000}
          sizes="(min-width: 1024px) 720px, 100vw"
          className="h-auto w-full rounded-lg transition-transform duration-500 ease-[var(--ease-out-strong)] group-hover:scale-[1.01]"
        />
        <span className="absolute end-3 top-3 flex size-8 items-center justify-center rounded-full bg-card/90 opacity-0 backdrop-blur transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
          <Expand aria-hidden className="size-4" />
        </span>
      </Button>
      {caption ? <figcaption className="text-center text-sm text-muted-foreground">{caption}</figcaption> : null}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton
          className="w-auto max-w-[min(92vw,1400px)] gap-2 p-2 sm:max-w-[min(92vw,1400px)]"
          style={styleVars({
            transformOrigin: `calc(50% + ${origin.x}px) calc(50% + ${origin.y}px)`,
            // Grows from the thumbnail's size rather than the dialog's 0.96.
            "--tw-enter-scale": "0.55",
            "--tw-exit-scale": "0.55",
          })}
        >
          <DialogTitle className="sr-only">{alt}</DialogTitle>
          <Image src={src} alt={alt} width={2400} height={1500} sizes="92vw" className="max-h-[82vh] w-auto rounded-lg object-contain" />
          {caption ? <DialogDescription className="px-2 pb-1 text-center text-sm">{caption}</DialogDescription> : (
            <DialogDescription className="sr-only">{alt}</DialogDescription>
          )}
        </DialogContent>
      </Dialog>
    </figure>
  );
}
