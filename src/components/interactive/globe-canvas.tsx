"use client";

import type { GlobeInstance } from "globe.gl";
import type { MeshPhongMaterial as Material } from "three";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { useThemeRevision } from "@/hooks/use-theme-revision";
import { tokenHex, tokenRgba } from "@/lib/css-color";
import { LAND_DOTS } from "@/lib/land-dots";
import type { GlobeOrg } from "@/lib/upstream/globe";

type Dot = { lat: number; lng: number; r: number; c: string; name?: string };

function isDot(v: object): v is Dot {
  return "lat" in v && "lng" in v && "r" in v;
}

/**
 * The scene. three and globe.gl are imported on mount only, so they never
 * reach the server render or the first bundle. Land is 3,300 merged dots
 * (one draw call); organizations are rings that pulse outward, so the eye
 * finds them. It turns slowly on its own, stops while dragged, and stays
 * still under reduced motion. Colours are read from the theme tokens and
 * repainted when the theme changes.
 */
export function GlobeCanvas({ orgs }: { orgs: GlobeOrg[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const globe = useRef<GlobeInstance | null>(null);
  const sphere = useRef<Material | null>(null);
  const [ready, setReady] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const reduced = useReducedMotion() ?? false;
  const theme = useThemeRevision();

  useEffect(() => {
    const el = ref.current;
    if (!el || globe.current) return;
    let disposed = false;
    let ro: ResizeObserver | null = null;
    void (async () => {
      const [{ default: Globe }, { MeshPhongMaterial, AmbientLight }] = [await import("globe.gl"), await import("three")];
      if (disposed) return;
      const material = new MeshPhongMaterial({ color: tokenHex("--card"), shininess: 4 });
      sphere.current = material;
      const g = new Globe(el)
        .width(el.clientWidth)
        .height(el.clientHeight)
        .backgroundColor("rgba(0,0,0,0)")
        .globeMaterial(material)
        .lights([new AmbientLight(0xffffff, Math.PI)])
        .showAtmosphere(true)
        .atmosphereAltitude(0.1)
        .pointAltitude(0)
        .pointResolution(4)
        .pointsMerge(true)
        .pointsTransitionDuration(0)
        .ringColor(() => (t: number) => tokenRgba("--primary", 1 - t))
        .ringMaxRadius(2.6)
        .ringPropagationSpeed(1.4)
        .ringRepeatPeriod(1800)
        .htmlElementsData([])
        .onPointHover((p) => setHover(p && isDot(p) ? (p.name ?? null) : null));
      g.pointOfView({ lat: 8, lng: 40, altitude: 1.7 });
      const controls = g.controls();
      controls.enableZoom = false;
      controls.autoRotateSpeed = 0.5;
      globe.current = g;
      setReady(true);
      ro = new ResizeObserver(() => g.width(el.clientWidth).height(el.clientHeight));
      ro.observe(el);
    })();
    return () => {
      disposed = true;
      ro?.disconnect();
      globe.current?._destructor();
      globe.current = null;
    };
  }, []);

  useEffect(() => {
    const g = globe.current;
    if (!g || !ready) return;
    const land: Dot[] = LAND_DOTS.map(([lng, lat]) => ({ lat, lng, r: 0.42, c: tokenRgba("--muted-foreground", 0.5) }));
    const sites: Dot[] = orgs.map((o) => ({ lat: o.lat, lng: o.lon, r: 0.9, c: tokenHex("--primary"), name: o.name }));
    sphere.current?.color.set(tokenHex("--card"));
    g.atmosphereColor(tokenHex("--primary"))
      .pointsData([...land, ...sites])
      .pointLat((p: object) => (isDot(p) ? p.lat : 0))
      .pointLng((p: object) => (isDot(p) ? p.lng : 0))
      .pointRadius((p: object) => (isDot(p) ? p.r : 0))
      .pointColor((p: object) => (isDot(p) ? p.c : "transparent"))
      .ringsData(reduced ? [] : sites.filter((_, i) => i % 3 === 0))
      .ringLat((p: object) => (isDot(p) ? p.lat : 0))
      .ringLng((p: object) => (isDot(p) ? p.lng : 0));
    g.controls().autoRotate = !reduced;
  }, [orgs, ready, reduced, theme]);

  return (
    <div className="relative aspect-[16/10] w-full">
      <div ref={ref} className="absolute inset-0 cursor-grab active:cursor-grabbing" aria-hidden />
      {!ready ? <div className="shimmer absolute inset-0" aria-hidden /> : null}
      <span
        className="pointer-events-none absolute start-3 top-3 rounded-full bg-card/90 px-3 py-1 text-xs font-medium backdrop-blur transition-opacity duration-150"
        style={{ opacity: hover ? 1 : 0 }}
        aria-live="polite"
      >
        {hover ?? ""}
      </span>
      <span className="sr-only">A turning globe with a green dot for each of {orgs.length} organizations.</span>
    </div>
  );
}
