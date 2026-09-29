"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export type CategoryMenuItem = { name: string; slug: string; count: number };

// "Browse by category" dropdown that sits on the front of a search bar.
// Categories are plain links (not a filter that needs a submit), so picking
// one goes straight to that category's page. Slugs are computed on the
// server and passed in — lib/courses imports the database client, which
// must never end up in a client bundle.
export default function CategoryMenu({
  categories,
  className = "",
}: {
  categories: CategoryMenuItem[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative shrink-0 ${className}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex h-full items-center gap-1.5 border border-r-0 border-hairline-dark px-3 text-[11px] font-bold uppercase tracking-eyebrow whitespace-nowrap text-ink-dark/70 transition-colors hover:text-ink-dark aria-expanded:text-ink-dark"
      >
        Categories
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
        />
      </button>
      {open && (
        <div
          id={panelId}
          className="absolute left-0 top-full z-40 mt-1 w-72 border border-hairline-dark bg-cream-dark shadow-2xl shadow-black/60"
        >
          <p className="px-4 pb-2 pt-3 text-[10px] font-bold uppercase tracking-eyebrow text-ink-dark/45">
            Browse by category
          </p>
          <ul className="max-h-80 overflow-y-auto pb-1">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/courses/category/${c.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between gap-3 px-4 py-2 text-sm text-ink-dark/80 transition-colors hover:bg-ink-dark/[0.06] hover:text-ink-dark"
                >
                  <span className="truncate">{c.name}</span>
                  <span className="text-xs tabular-nums text-ink-dark/40">{c.count}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/courses/category"
            onClick={() => setOpen(false)}
            className="block border-t border-hairline-dark px-4 py-3 text-[11px] font-bold uppercase tracking-eyebrow text-ink-dark/70 transition-colors hover:text-ink-dark"
          >
            All categories &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
