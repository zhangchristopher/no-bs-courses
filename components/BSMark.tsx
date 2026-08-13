// Standalone crossed-"BS" mark, separate from the full wordmark (Logo.tsx) —
// for anywhere a small square mark is useful (next to the wordmark, an
// empty-state illustration, a loading indicator). Same asset as the
// favicon (app/icon.png), just served from public/ so it can be reused
// inline. It's black-on-transparent, so it reads on light backgrounds; on a
// dark surface, pair it with a light background behind it (it isn't
// theme-swapped like the full Logo, since most uses of a small mark like
// this are against a fixed surface, not the page background directly).
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
