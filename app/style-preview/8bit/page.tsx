import { Big_Shoulders, Manrope } from "next/font/google";
import PosterRow8bit from "@/components/style-preview/PosterRow8bit";
import {
  HERO_BADGE,
  HERO_HEADLINE_PRE,
  HERO_HEADLINE_ACCENT,
  HERO_HEADLINE_POST,
  HERO_SUBHEAD,
  STATS,
  CATEGORIES,
  FOOTER_COLUMNS,
} from "@/lib/style-preview-data";

const bigShoulders = Big_Shoulders({
  variable: "--font-big-shoulders",
  subsets: ["latin"],
  weight: ["900"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const X_ICON = (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
    <path d="M18.9 2H22l-7.6 8.7L23 22h-6.9l-5.4-6.9L4.5 22H1.4l8.2-9.3L1 2h7.1l4.9 6.4L18.9 2z" />
  </svg>
);
const LI_ICON = (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
    <path d="M4.98 3.5C4.98 4.9 3.9 6 2.5 6S0 4.9 0 3.5 1.1 1 2.5 1s2.48 1.1 2.48 2.5zM.2 8.5h4.6V23H.2V8.5zM8.4 8.5h4.4v2h.06c.6-1.1 2.1-2.3 4.3-2.3 4.6 0 5.4 3 5.4 6.9V23h-4.6v-6.9c0-1.6 0-3.7-2.3-3.7-2.3 0-2.6 1.8-2.6 3.6V23H8.4V8.5z" />
  </svg>
);
const IG_ICON = (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
    <path d="M12 2.2c3.2 0 3.6 0 4.9.07 3.3.15 4.8 1.7 4.95 4.95.07 1.3.07 1.65.07 4.85s0 3.55-.07 4.85c-.15 3.25-1.65 4.8-4.95 4.95-1.3.07-1.65.07-4.9.07s-3.6 0-4.9-.07c-3.3-.15-4.8-1.7-4.95-4.95C2.08 15.65 2.08 15.3 2.08 12s0-3.55.07-4.85C2.3 3.9 3.8 2.35 7.1 2.2 8.4 2.15 8.75 2.15 12 2.15M12 0C8.7 0 8.35 0 7.05.07c-4.35.2-6.78 2.6-6.98 6.98C0 8.35 0 8.7 0 12s0 3.65.07 4.95c.2 4.35 2.6 6.78 6.98 6.98C8.35 24 8.7 24 12 24s3.65 0 4.95-.07c4.35-.2 6.78-2.6 6.98-6.98C24 15.65 24 15.3 24 12s0-3.65-.07-4.95C23.73 2.7 21.3.27 16.95.07 15.65 0 15.3 0 12 0zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4zm6.4-10.4a1.44 1.44 0 1 1-1.44-1.44 1.44 1.44 0 0 1 1.44 1.44z" />
  </svg>
);

export const metadata = { title: "Style Preview — 8-bit" };

export default function EightBitPreview() {
  return (
    <div className={`${bigShoulders.variable} ${manrope.variable} bg-white text-black`} style={{ fontFamily: "var(--font-manrope)" }}>
      {/* Nav */}
      <div className="flex items-center justify-between border-b-2 border-black px-11 py-5">
        <img src="/style-preview/logo-pixel-onwhite.png" alt="No BS Courses" className="h-6 w-auto [image-rendering:pixelated]" />
        <div className="hidden gap-8 text-xs font-bold uppercase tracking-wide text-[#4a4636] sm:flex">
          <span>Courses</span>
          <span>Categories</span>
          <span>Reviews</span>
        </div>
        <div className="rounded-[2px] bg-black px-4 py-2.5 text-[11.5px] font-bold uppercase tracking-wide text-white">Sign up free</div>
      </div>

      {/* Hero */}
      <div className="px-11 pt-11">
        <div className="border-[3px] border-black">
          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr]">
            <div className="border-b-2 border-black p-8 md:border-b-0 md:border-r-2 md:p-12">
              <span className="inline-flex items-center gap-2 rounded-[2px] border-[1.5px] border-black px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide">
                <span className="h-1.5 w-1.5 bg-red-600" />
                {HERO_BADGE}
              </span>
              <h1
                className="mt-5 mb-4 text-[42px] font-black leading-[0.98] tracking-tight sm:text-[58px]"
                style={{ fontFamily: "var(--font-big-shoulders)" }}
              >
                {HERO_HEADLINE_PRE} <span className="text-red-600">{HERO_HEADLINE_ACCENT}</span> {HERO_HEADLINE_POST}
              </h1>
              <p className="max-w-[40ch] text-base leading-relaxed text-[#33301f]">{HERO_SUBHEAD}</p>
            </div>
            <div className="flex flex-col p-7">
              <div className="relative flex-1 overflow-hidden border-2 border-black">
                <img
                  src="/style-preview/pixel-sheep-hero.jpg"
                  alt="A black sheep standing out among a flock of white sheep, pixel art"
                  className="absolute inset-0 h-full w-full object-cover [image-rendering:pixelated]"
                />
              </div>
              <div className="flex justify-between pt-2.5 text-[10px] font-bold uppercase tracking-wide text-[#6b6656]">
                <span>Fig. 01</span>
                <span>The one that stands out</span>
              </div>
            </div>
          </div>
          <div className="relative flex border-t-2 border-black">
            <div className="absolute -top-[3px] left-0 right-0 h-[3px] bg-[repeating-linear-gradient(90deg,#0a0a0a_0,#0a0a0a_1px,transparent_1px,transparent_10px)]" />
            {STATS.map((s, i) => (
              <div key={s.label} className={`flex-1 p-5 ${i < STATS.length - 1 ? "border-r border-black" : ""}`}>
                <div className="text-[38px] font-black leading-none tracking-tight tabular-nums" style={{ fontFamily: "var(--font-big-shoulders)" }}>
                  {s.value}
                </div>
                <div className="my-2.5 h-1 w-[22px] bg-red-600" />
                <div className="text-[10.5px] font-bold uppercase tracking-wide text-[#6b6656]">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-11 pt-9">
        <div className="flex gap-2 rounded-[2px] border-2 border-black bg-white p-2">
          <input
            placeholder="Search 2,180 verified course listings…"
            className="flex-1 border-none px-3.5 py-3 text-sm text-[#999] outline-none"
          />
          <button className="whitespace-nowrap rounded-[2px] bg-black px-6 py-3 text-[11.5px] font-bold uppercase tracking-wide text-white">
            Search
          </button>
        </div>
      </div>

      {/* Category rows */}
      <div className="mt-11 bg-white pb-2 pt-13">
        {CATEGORIES.map((cat, ci) => {
          const shadeOffset = CATEGORIES.slice(0, ci).reduce((n, c) => n + c.courses.length, 0);
          return (
            <div key={cat.name} className="px-11 pb-11">
              <div className="mb-3.5 border-t-2 border-black pt-3">
                <h3 className="text-lg font-black uppercase tracking-tight" style={{ fontFamily: "var(--font-big-shoulders)" }}>
                  {cat.name}
                </h3>
              </div>
              <div className="mb-3.5 flex gap-1.5 overflow-x-auto pb-0.5">
                {cat.subcats.map((s, i) => (
                  <span
                    key={s}
                    className={`shrink-0 whitespace-nowrap rounded-[2px] border-[1.5px] px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide ${i === 0 ? "border-black bg-black text-white" : "border-black bg-white text-[#4a4636]"}`}
                  >
                    {s}
                  </span>
                ))}
              </div>
              <PosterRow8bit courses={cat.courses} shadeOffset={shadeOffset} />
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="overflow-hidden border-t-[3px] border-black bg-black px-11 pt-15 text-[#d8d4c8]">
        <div className="flex flex-wrap justify-between gap-8 pb-11">
          <div className="max-w-[260px]">
            <img src="/style-preview/logo-pixel-onblack.png" alt="No BS Courses" className="mb-3.5 h-6 w-auto [image-rendering:pixelated]" />
            <p className="mb-4 text-[12.5px] leading-relaxed text-[#8a8578]">
              Verified reviews from people who actually paid — not marketing copy dressed up as a rating.
            </p>
            <div className="flex gap-2.5">
              {[X_ICON, LI_ICON, IG_ICON].map((icon, i) => (
                <a key={i} href="#" className="flex h-[30px] w-[30px] items-center justify-center rounded-[2px] border-[1.5px] border-[#3a3a3c]">
                  {icon}
                </a>
              ))}
            </div>
          </div>
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.head}>
              <div className="mb-4 border-b-2 border-[#3a3a3c] pb-1.5 text-[11px] font-bold uppercase tracking-wide text-white">{col.head}</div>
              {col.links.map((l) => (
                <span key={l} className="mb-2.5 block text-[13px] text-[#b8b3a4]">
                  {l}
                </span>
              ))}
            </div>
          ))}
        </div>
        <div className="-mx-11 overflow-hidden py-7">
          <img src="/style-preview/logo-pixel-onblack.png" alt="No BS Courses" className="block w-full [image-rendering:pixelated]" />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 py-5 text-[11.5px] uppercase tracking-wide text-[#6b6656]">
          <span>© 2026 No BS Courses. Verified reviews since day one.</span>
          <div className="flex gap-5">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </div>
  );
}
