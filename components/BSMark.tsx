// Standalone crossed-"BS" mark, separate from the full wordmark (Logo.tsx) —
// for anywhere a small square mark is useful (next to the wordmark, an
// empty-state illustration, a loading indicator). Same asset as the
// favicon (app/icon.png), just served from public/ so it can be reused
// inline. It's black-on-transparent, so it only reads on a light surface —
// the site is dark-only, so always give it a light background behind it
// rather than placing it straight on the page ground.
export default function BSMark({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/bs-mark.png"
      alt="No BS"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size }}
    />
  );
}
