import {
  HERO_HEADLINE_PRE,
  HERO_HEADLINE_ACCENT,
  HERO_HEADLINE_POST,
  HERO_SUBHEAD,
  CATEGORIES,
  FOOTER_COLUMNS,
} from "@/lib/style-preview-data";

export const metadata = { title: "Style Preview — Editorial Minimal" };

const CREAM = "#f6f3ec";

const FEATURES = [
  { icon: "✓", label: "Verified-Purchase Reviews", sub: "Every reviewer actually paid" },
  { icon: "$", label: "Zero Pay-to-Rank", sub: "No listing buys its way up" },
  { icon: "◆", label: "Real Accounts Only", sub: "No anonymous drive-by ratings" },
  { icon: "▤", label: "Admin-Reviewed Listings", sub: "Every course checked before it's live" },
];

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="text-[11px] tracking-wide text-black">
      {"★★★★★".slice(0, full)}
      <span className="text-black/25">{"★★★★★".slice(full)}</span>
    </span>
  );
}

export default function EditorialMinimalPreview() {
  return (
    <div style={{ background: CREAM }} className="text-black">
      {/* Utility bar */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 bg-black px-4 py-2 text-center text-[10.5px] uppercase tracking-[0.1em] text-white/80 sm:justify-between sm:px-14">
        <span>Verified Reviews Only · No Pay-to-Rank · Admin-Reviewed Listings</span>
        <span className="hidden sm:inline">Help · Sign In</span>
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between border-b border-black/10 px-8 py-6 sm:px-14">
        <img src="/logo-light.png" alt="No BS Courses" className="h-6 w-auto" />
        <div className="hidden gap-10 text-[13px] tracking-wide sm:flex">
          <span className="border-b-2 border-black pb-0.5">Home</span>
          <span>Courses</span>
          <span>Categories</span>
          <span>About</span>
        </div>
        <button className="rounded-none bg-black px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-white">
          Sign Up
        </button>
      </div>

      {/* Hero stage — giant wordmark with the photo layered on top of it */}
      <div className="relative h-[420px] overflow-hidden sm:h-[560px]">
        <div
          aria-hidden
          className="absolute inset-0 flex select-none items-center justify-center whitespace-nowrap text-[26vw] font-black uppercase leading-none tracking-tighter text-black sm:text-[16vw]"
        >
          NO BS
        </div>
        <div className="absolute inset-y-0 left-1/2 z-10 w-[46%] -translate-x-1/2 overflow-hidden shadow-[0_40px_80px_-30px_rgba(0,0,0,0.35)] sm:w-[38%]">
          <img
            src="/style-preview/sheep-hero-realistic.jpg"
            alt="A black sheep standing out among a flock of white sheep"
            className="h-full w-full object-cover object-right"
          />
        </div>

        <p className="absolute left-6 top-6 z-20 border-b border-black/30 pb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-black/70 sm:left-14 sm:top-10">
          Courses That Actually Deliver.
        </p>
        <p className="absolute right-6 top-6 z-20 text-[11px] font-semibold uppercase tracking-[0.22em] text-black/50 sm:right-14 sm:top-10">
          Verified Since 2026
        </p>

        <div className="absolute bottom-6 left-6 z-20 max-w-[15ch] sm:bottom-12 sm:left-14 sm:max-w-[13ch]">
          <h1 className="mb-4 text-[26px] font-black uppercase leading-[1] tracking-tight sm:text-[38px]">
            {HERO_HEADLINE_PRE} <span className="whitespace-nowrap">{HERO_HEADLINE_ACCENT}</span> {HERO_HEADLINE_POST}
          </h1>
          <div className="flex flex-wrap items-center gap-5">
            <button className="bg-black px-6 py-3 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-white">
              See The Real Reviews
            </button>
            <span className="border-b border-black/40 text-[11.5px] font-semibold uppercase tracking-[0.08em]">Browse Courses</span>
          </div>
        </div>
      </div>

      {/* Subhead */}
      <div className="border-b border-black/10 px-8 py-8 sm:px-14">
        <p className="mx-auto max-w-[52ch] text-center text-[14.5px] leading-relaxed text-black/65">{HERO_SUBHEAD}</p>
      </div>

      {/* Category strip */}
      <div className="border-b border-black/10 bg-black px-8 py-12 sm:px-14">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 sm:grid-cols-4">
          {CATEGORIES.map((cat) => (
            <div key={cat.name} className="group cursor-pointer">
              <div className="mb-4 flex aspect-square items-center justify-center border border-white/15 bg-[#141414]">
                <span className="px-4 text-center text-sm font-black uppercase leading-tight tracking-tight text-white">{cat.name}</span>
              </div>
              <p className="text-[12.5px] font-semibold uppercase tracking-[0.04em] text-white">{cat.name}</p>
              <p className="text-[11.5px] text-white/50">Shop {cat.courses.length} verified courses →</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature row */}
      <div className="grid grid-cols-2 gap-8 px-8 py-12 sm:grid-cols-4 sm:px-14">
        {FEATURES.map((f) => (
          <div key={f.label} className="flex flex-col items-center text-center sm:items-start sm:text-left">
            <span className="mb-3 text-xl">{f.icon}</span>
            <p className="text-[13px] font-semibold uppercase tracking-[0.03em]">{f.label}</p>
            <p className="mt-1 text-[11.5px] text-black/50">{f.sub}</p>
          </div>
        ))}
      </div>

      {/* Course sections */}
      {CATEGORIES.map((cat) => (
        <div key={cat.name} className="border-t border-black/10 px-8 py-14 sm:px-14">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex items-baseline justify-between">
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-black/50">Verified Courses</p>
                <h2 className="text-2xl font-black uppercase tracking-tight">{cat.name}</h2>
              </div>
              <span className="border-b border-black/40 text-[12px] font-semibold uppercase tracking-[0.08em]">View All</span>
            </div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {cat.courses.map((course) => (
                <div key={course.title}>
                  <div className="relative mb-3 flex aspect-video items-center justify-center border border-black/10 bg-white">
                    <span className="absolute right-2.5 top-2.5 text-black/30">♡</span>
                    <span className="px-4 text-center text-[13px] font-bold uppercase leading-tight text-black/70">{course.title}</span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[13.5px] font-semibold leading-snug">{course.title}</p>
                      <p className="text-[11.5px] text-black/50">{course.provider}</p>
                    </div>
                    <p className="whitespace-nowrap text-[13.5px] font-semibold">
                      {course.price}
                      {course.recurring && <span className="text-[10px] font-normal text-black/50">/mo</span>}
                    </p>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Stars rating={course.rating} />
                    <span className="text-[11px] text-black/45">({course.reviewCount})</span>
                    {course.flagged && <span className="text-[10.5px] font-semibold uppercase tracking-wide text-black/40">· Flagged</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Footer */}
      <div className="border-t border-black/10 px-8 py-16 sm:px-14">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 sm:grid-cols-5">
          <div className="col-span-2">
            <img src="/logo-light.png" alt="No BS Courses" className="mb-4 h-6 w-auto" />
            <p className="max-w-[32ch] text-[12.5px] leading-relaxed text-black/55">
              Verified reviews from people who actually paid — not marketing copy dressed up as a rating.
            </p>
          </div>
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.head}>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-black/50">{col.head}</p>
              {col.links.map((l) => (
                <span key={l} className="mb-2.5 block text-[13px] text-black/70">
                  {l}
                </span>
              ))}
            </div>
          ))}
        </div>
        <div className="mx-auto mt-14 max-w-6xl border-t border-black/10 pt-6 text-[11.5px] text-black/45">
          © 2026 No BS Courses. Verified reviews since day one.
        </div>
      </div>
    </div>
  );
}
