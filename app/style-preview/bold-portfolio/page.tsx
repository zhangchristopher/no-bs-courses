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

export const metadata = { title: "Style Preview — Bold Portfolio" };

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="text-[11px] text-red-500">
      {"★★★★★".slice(0, full)}
      <span className="text-white/20">{"★★★★★".slice(full)}</span>
    </span>
  );
}

export default function BoldPortfolioPreview() {
  return (
    <div className="bg-[#0a0a0a] text-white">
      {/* Nav */}
      <div className="flex items-center justify-between px-8 py-6 sm:px-14">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-red-500">Course Platform</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Verified Reviews Only</p>
        </div>
        <img src="/logo-dark.png" alt="No BS Courses" className="h-6 w-auto" />
        <p className="text-right text-[10px] uppercase tracking-[0.2em] text-white/50">
          Trusted By
          <br />
          38,000+ Learners
        </p>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden px-8 pt-8 sm:px-14">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-4 top-0 -z-0 select-none text-[26vw] font-black uppercase leading-[0.78] tracking-tighter text-red-600/90 sm:text-[19vw]"
        >
          NO BS
        </div>
        <div className="relative z-10 grid grid-cols-1 gap-10 pb-8 pt-40 md:grid-cols-[1fr_1.1fr] md:pt-56">
          <div className="self-end">
            <p className="mb-4 text-[13px] font-semibold uppercase tracking-[0.15em] text-red-500">{HERO_BADGE}</p>
            <h1 className="mb-5 max-w-[15ch] text-3xl font-black uppercase leading-[1.05] tracking-tight sm:text-4xl">
              {HERO_HEADLINE_PRE} <span className="text-red-500">{HERO_HEADLINE_ACCENT}</span> {HERO_HEADLINE_POST}
            </h1>
            <p className="max-w-[38ch] text-[14px] leading-relaxed text-white/60">{HERO_SUBHEAD}</p>
            <p className="mt-3 text-[11px] uppercase tracking-[0.15em] text-white/40">Available Worldwide</p>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] w-full overflow-hidden border border-white/10">
              <img
                src="/style-preview/sheep-hero-realistic.jpg"
                alt="A black sheep standing out among a flock of white sheep"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-6 border-y border-white/10 px-8 py-10 sm:grid-cols-3 sm:px-14">
        {[
          { value: STATS[2].value + "+", label: "Verified Courses" },
          { value: STATS[0].value + "+", label: "Real Reviews" },
          { value: "0", label: "Pay-to-Rank Listings" },
        ].map((s) => (
          <div key={s.label}>
            <p className="text-4xl font-black text-red-500">{s.value}</p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/50">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Numbered category showcase */}
      <div className="px-8 py-16 sm:px-14">
        <div className="mb-10 flex items-baseline justify-between">
          <h2 className="text-2xl font-black uppercase tracking-tight">Verified Categories</h2>
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-red-500">View All →</span>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((cat, i) => (
            <div key={cat.name}>
              <div className="mb-4 flex aspect-[4/3] items-center justify-center border border-white/10 bg-[#141414]">
                <span className="px-3 text-center text-lg font-black uppercase leading-tight tracking-tight text-red-500">{cat.name}</span>
              </div>
              <p className="text-lg font-black text-red-500">{String(i + 1).padStart(2, "0")}</p>
              <p className="text-[13px] font-bold uppercase tracking-wide">{cat.name}</p>
              <p className="text-[11px] uppercase tracking-[0.1em] text-white/40">{cat.courses.length} Verified Listings</p>
            </div>
          ))}
        </div>
      </div>

      {/* Course grids per category */}
      {CATEGORIES.map((cat) => (
        <div key={cat.name} className="border-t border-white/10 px-8 py-14 sm:px-14">
          <h3 className="mb-8 text-xl font-black uppercase tracking-tight text-white/90">{cat.name}</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cat.courses.map((course, i) => (
              <div key={course.title} className="border border-white/10 bg-[#111]">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
                  <span className="text-[11px] font-black text-red-500">{String(i + 1).padStart(2, "0")}</span>
                  {course.flagged ? (
                    <span className="text-[10px] font-bold uppercase tracking-wide text-red-500">Flagged</span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wide text-white/40">
                      {course.verified ? "Verified" : "Unclaimed"}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="mb-1 text-[14px] font-bold leading-snug">{course.title}</p>
                  <p className="mb-3 text-[11.5px] text-white/45">{course.provider}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Stars rating={course.rating} />
                      <span className="text-[10.5px] text-white/40">({course.reviewCount})</span>
                    </div>
                    <span className="text-[14px] font-black text-white">
                      {course.price}
                      {course.recurring && <span className="text-[10px] font-normal text-white/50">/mo</span>}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* CTA card */}
      <div className="px-8 py-16 sm:px-14">
        <div className="relative overflow-hidden border border-red-900/40 bg-gradient-to-br from-red-950/40 to-black p-10 sm:p-16">
          <span className="mb-6 inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
          <p className="max-w-[24ch] text-2xl font-black uppercase leading-tight tracking-tight sm:text-3xl">
            &ldquo;A review is only proof if the reviewer actually paid.&rdquo;
          </p>
          <p className="mt-6 text-[12px] uppercase tracking-[0.15em] text-white/50">— No BS Courses, verification policy</p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 px-8 py-16 sm:px-14">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-5">
          <div className="col-span-2">
            <img src="/logo-dark.png" alt="No BS Courses" className="mb-4 h-6 w-auto" />
            <p className="max-w-[32ch] text-[12.5px] leading-relaxed text-white/45">
              Verified reviews from people who actually paid — not marketing copy dressed up as a rating.
            </p>
          </div>
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.head}>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-red-500">{col.head}</p>
              {col.links.map((l) => (
                <span key={l} className="mb-2.5 block text-[13px] text-white/60">
                  {l}
                </span>
              ))}
            </div>
          ))}
        </div>
        <div className="mt-14 border-t border-white/10 pt-6 text-[11.5px] text-white/35">
          © 2026 No BS Courses. Verified reviews since day one.
        </div>
      </div>
    </div>
  );
}
