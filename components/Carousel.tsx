"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Netflix-style horizontal row. Native overflow scrolling with snap points
// does the real work — touch swipe, trackpad, and tabbing into an
// off-screen card all just scroll the row, no JS needed — and the arrow
// buttons are a pointer-only convenience layered on top (hidden below sm,
// where swiping is the natural gesture). The track is full-bleed but padded
// by .bleed-row so its first card lines up with the page's content column.
export default function Carousel({ label, children }: { label: string; children: ReactNode }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  const page = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const arrowClass =
    "absolute inset-y-0 z-10 hidden w-10 items-center justify-center text-ink-dark opacity-0 transition-opacity focus-visible:opacity-100 group-hover/row:opacity-100 disabled:pointer-events-none disabled:!opacity-0 sm:flex lg:w-14";

  return (
    <div className="group/row relative">
      <ul
        ref={trackRef}
        onScroll={update}
        aria-label={label}
        className="bleed-row flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-1 sm:gap-4"
      >
        {Children.map(children, (child) => (
          <li className="flex w-[78%] shrink-0 snap-start sm:w-[46%] lg:w-[31.5%] xl:w-[23.5%] [&>*]:flex-1">
            {child}
          </li>
        ))}
      </ul>
      <button
        type="button"
        aria-label={`Scroll ${label} left`}
        onClick={() => page(-1)}
        disabled={atStart}
        className={`${arrowClass} left-0 bg-gradient-to-r from-cream-dark via-cream-dark/80 to-transparent`}
      >
        <ChevronLeft className="h-8 w-8" strokeWidth={1.5} />
      </button>
      <button
        type="button"
        aria-label={`Scroll ${label} right`}
        onClick={() => page(1)}
        disabled={atEnd}
        className={`${arrowClass} right-0 bg-gradient-to-l from-cream-dark via-cream-dark/80 to-transparent`}
      >
        <ChevronRight className="h-8 w-8" strokeWidth={1.5} />
      </button>
    </div>
  );
}
