"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import type { PreviewCourse } from "@/lib/style-preview-data";

const SHIELD_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#9a9690">
    <path d="M12 2l8 3.2v6C20 16.5 16.9 20.6 12 22 7.1 20.6 4 16.5 4 11.2v-6L12 2z" />
  </svg>
);

const CHECK_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="#e00000" />
    <path d="M7.5 12.5l3 3 6-6.5" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const THUMB_SHADES = ["#e9e6dd", "#e2e8e3", "#e6e2ea", "#eae4dc", "#dde6e6", "#eae0d8"];

function stars(rating: number) {
  const full = Math.round(rating);
  return "★★★★★".slice(0, full) + "☆☆☆☆☆".slice(0, 5 - full);
}

export default function PosterRow8bit({
  courses,
  shadeOffset,
}: {
  courses: PreviewCourse[];
  shadeOffset: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [prevDisabled, setPrevDisabled] = useState(true);
  const [nextDisabled, setNextDisabled] = useState(false);

  const updateArrows = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    setPrevDisabled(track.scrollLeft <= 4);
    setNextDisabled(track.scrollLeft >= max - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [updateArrows]);

  function smoothScrollBy(delta: number) {
    const el = trackRef.current;
    if (!el) return;
    const start = el.scrollLeft;
    const max = el.scrollWidth - el.clientWidth;
    const target = Math.max(0, Math.min(max, start + delta));
    const dist = target - start;
    const duration = 350;
    let startTime: number | null = null;
    function step(ts: number) {
      if (startTime === null) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      if (el) el.scrollLeft = start + dist * ease;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => smoothScrollBy(-(trackRef.current?.clientWidth ?? 0) * 0.85)}
        className={`absolute -left-[18px] top-[70px] z-10 flex h-10 w-10 items-center justify-center rounded-[2px] bg-black text-lg font-bold text-white shadow-[0_6px_16px_rgba(10,10,10,0.35)] transition-opacity ${prevDisabled ? "pointer-events-none opacity-0" : "opacity-100"}`}
      >
        ‹
      </button>
      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => smoothScrollBy((trackRef.current?.clientWidth ?? 0) * 0.85)}
        className={`absolute -right-[18px] top-[70px] z-10 flex h-10 w-10 items-center justify-center rounded-[2px] bg-black text-lg font-bold text-white shadow-[0_6px_16px_rgba(10,10,10,0.35)] transition-opacity ${nextDisabled ? "pointer-events-none opacity-0" : "opacity-100"}`}
      >
        ›
      </button>
      <div className="pointer-events-none absolute inset-y-0 right-0 z-[5] w-[60px] bg-gradient-to-r from-transparent to-white" />
      <div
        ref={trackRef}
        onScroll={updateArrows}
        className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {courses.map((course, i) => {
          const shade = THUMB_SHADES[(shadeOffset + i) % THUMB_SHADES.length];
          const priceNode = course.price === "Free" ? (
            course.price
          ) : (
            <>
              {course.price}
              {course.recurring && <span className="ml-px text-[9.5px] font-bold lowercase text-[#857f68]">/mo</span>}
            </>
          );
          return (
            <div
              key={course.title}
              className={`w-[250px] shrink-0 cursor-pointer border-[1.5px] bg-white transition-[box-shadow,transform] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#0a0a0a] ${course.flagged ? "border-red-600" : "border-black"}`}
            >
              <div className="relative aspect-video overflow-hidden border-b-[1.5px] border-black" style={{ background: shade }}>
                {course.flagged && (
                  <span className="absolute left-1.5 top-1.5 z-[2] rounded-[2px] border-[1.5px] border-red-600 bg-white px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-red-600">
                    Flagged
                  </span>
                )}
                <span className="absolute bottom-1.5 right-1.5 z-[2] rounded-[2px] bg-black px-1.5 py-0.5 text-[10.5px] font-bold tabular-nums text-white">
                  {course.duration}
                </span>
              </div>
              <div className="p-3">
                <div className="mb-0.5 flex items-center gap-1">
                  <h4 className="text-[13px] font-bold leading-tight text-black">{course.title}</h4>
                  <span className="inline-flex shrink-0 gap-0.5">
                    {course.flagged ? null : (
                      <>
                        {course.business && SHIELD_ICON}
                        {course.verified && CHECK_ICON}
                      </>
                    )}
                  </span>
                </div>
                <div className="mb-1.5 text-[11px] text-[#857f68]">{course.provider}</div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-black">
                    {stars(course.rating)} <span className="text-[#857f68]">({course.reviewCount})</span>
                  </span>
                  <span className="text-sm font-black text-black" style={{ fontFamily: "var(--font-big-shoulders)" }}>
                    {priceNode}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
