// The site is dark-only, so the wordmark is always the white-on-transparent
// export. A plain <img> rather than next/image so it scales to whatever
// height or width the caller sets instead of a fixed intrinsic box.
export default function Logo({
  className,
  imgClassName = "block h-7 w-auto",
}: {
  className?: string;
  imgClassName?: string;
}) {
  return (
    <span className={`inline-block ${className ?? ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-dark.png" alt="No BS Courses" className={imgClassName} />
    </span>
  );
}
