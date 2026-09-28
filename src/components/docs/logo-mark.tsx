/**
 * The official GainForest "G leaf" mark.
 *
 * A CSS mask, not an `<img>`, so the single-colour artwork takes `currentColor`
 * and sits correctly on any rung of the tonal ladder without a second file per
 * theme. Ported from `gainforest-app`'s `Logo.tsx`, same
 * `/decor/gainforest-logo.svg`, so the two apps show the same mark.
 */
export function LogoMark({
  className = "size-7",
  title,
}: {
  className?: string;
  /** When given, the mark is an image with that name. Omitted, it is
   *  presentation and stays out of the accessibility tree. */
  title?: string;
}) {
  return (
    <span
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={`inline-block bg-current mask-center mask-contain mask-no-repeat ${className}`}
      style={{
        // Tailwind v4 has no mask-image utility for an arbitrary URL, and this
        // is the one place the artwork is named. Both properties are required:
        // the prefixed form is what Safari reads.
        WebkitMaskImage: "url(/decor/gainforest-logo.svg)",
        maskImage: "url(/decor/gainforest-logo.svg)",
      }}
    />
  );
}
