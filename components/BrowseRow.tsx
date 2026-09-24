import Link from "next/link";
import type { ReactNode } from "react";
import Carousel from "@/components/Carousel";
import { ArrowIcon } from "@/components/icons";

// One full-bleed row on a browse surface: heading in the content column,
// the carousel running edge to edge, and an optional "see everything" link
// under it for when the row is only a preview of a longer list.
export default function BrowseRow({
  title,
  eyebrow,
  subtitle,
  titleHref,
  href,
  hrefLabel,
  children,
}: {
  title: string;
  eyebrow?: string;
  subtitle?: ReactNode;
  titleHref?: string;
  href?: string;
  hrefLabel?: string;
  children: ReactNode;
}) {
  return (
    <section className="py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {eyebrow && (
          <p className="text-[11px] font-bold uppercase tracking-eyebrow text-ink-dark/50">
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl font-black uppercase tracking-headline text-ink-dark sm:text-3xl">
          {titleHref ? (
            <Link href={titleHref} className="hover:underline">
              {title}
            </Link>
          ) : (
            title
          )}
        </h2>
        {subtitle && <p className="mt-1 text-sm text-ink-dark/55">{subtitle}</p>}
      </div>
      <div className="mt-5">
        <Carousel label={title}>{children}</Carousel>
      </div>
      {href && hrefLabel && (
        <div className="mx-auto mt-5 max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href={href}
            className="group inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-label text-ink-dark/70 transition-colors hover:text-ink-dark"
          >
            {hrefLabel}
            <ArrowIcon className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
          </Link>
        </div>
      )}
    </section>
  );
}
