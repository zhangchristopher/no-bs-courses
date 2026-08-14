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

export const metadata = { title: "Style Preview — E-commerce Polish" };

const CREAM = "#faf7f1";
const AVATAR_INITIALS = ["JM", "AK", "RS", "TL"];

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="text-[11px] text-amber-500">
      {"★★★★★".slice(0, full)}
      <span className="text-black/15">{"★★★★★".slice(full)}</span>
    </span>
  );
}

function FloatingCard({ title, price, rating, className }: { title: string; price: string; rating: number; className: string }) {
  return (
    <div className={`absolute z-10 flex items-center gap-2 rounded-xl border border-black/5 bg-white px-3 py-2 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.25)] ${className}`}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black">
        <span className="text-[8px] font-black uppercase text-white">{title.slice(0, 2)}</span>
      </div>
      <div>
        <p className="text-[11px] font-semibold leading-tight">{title}</p>
        <p className="text-[10.5px] text-black/50">
          {price} · <Stars rating={rating} />
        </p>
      </div>
    </div>
  );
}

export default function EcommercePolishPreview() {
  const featured = CATEGORIES[0].courses[0];
  const featured2 = CATEGORIES[2].courses[0];
  const featured3 = CATEGORIES[3].courses[1];

  return (
    <div style={{ background: CREAM }} className="text-black">
      {/* Announcement bar */}
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-1 bg-black px-4 py-2 text-[11px] text-white">
        <span>📋 1,200+ Courses Reviewed This Month</span>
        <span>✓ Verified-Purchase Reviews Only</span>
        <span>⚡ New Listings Added Weekly</span>
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between px-8 py-4 sm:px-14">
        <img src="/logo-light.png" alt="No BS Courses" className="h-6 w-auto" />
        <div className="hidden gap-7 text-[13.5px] font-medium sm:flex">
          <span>Home</span>
          <span>Courses</span>
          <span className="text-red-600">Categories</span>
          <span>About</span>
          <span>Blog</span>
        </div>
        <div className="flex items-center gap-4 text-lg">
          <span>🔍</span>
          <span>♡</span>
          <span className="relative">
            🛒<span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] text-white">3</span>
          </span>
        </div>
      </div>

      {/* Hero */}
      <div className="grid grid-cols-1 items-center gap-10 px-8 py-10 sm:px-14 md:grid-cols-2 md:py-16">
        <div>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-red-600">{HERO_BADGE}</p>
          <h1 className="mb-4 max-w-[13ch] text-4xl font-black leading-[1.05] sm:text-5xl">
            {HERO_HEADLINE_PRE} <span className="text-red-600">{HERO_HEADLINE_ACCENT}</span> {HERO_HEADLINE_POST}
          </h1>
          <p className="mb-7 max-w-[42ch] text-[15px] leading-relaxed text-black/60">{HERO_SUBHEAD}</p>
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <button className="rounded-full bg-red-600 px-7 py-3 text-[13px] font-bold text-white shadow-[0_10px_24px_-8px_rgba(224,0,0,0.55)]">
              Shop Verified Courses
            </button>
            <button className="rounded-full border border-black/15 bg-white px-6 py-3 text-[13px] font-semibold">Explore Collection</button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {AVATAR_INITIALS.map((initials) => (
                <div key={initials} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-black text-[9px] font-bold text-white">
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-[12.5px] text-black/55">
              Trusted by <span className="font-semibold text-black">{STATS[1].value}+ learners</span> worldwide
            </p>
          </div>
        </div>
        <div className="relative">
          <div className="aspect-square w-full overflow-hidden rounded-3xl bg-white shadow-[0_30px_60px_-20px_rgba(0,0,0,0.2)]">
            <img
              src="/style-preview/sheep-hero-realistic.jpg"
              alt="A black sheep standing out among a flock of white sheep"
              className="h-full w-full object-cover"
            />
          </div>
          <FloatingCard title={featured.title} price={featured.price} rating={featured.rating} className="-left-6 top-8 hidden sm:flex" />
          <FloatingCard title={featured2.title} price={featured2.price} rating={featured2.rating} className="-right-6 top-1/3 hidden sm:flex" />
          <FloatingCard title={featured3.title} price={featured3.price} rating={featured3.rating} className="-bottom-4 left-10 hidden sm:flex" />
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-1 gap-4 border-y border-black/5 bg-white px-8 py-8 sm:grid-cols-3 sm:px-14">
        {STATS.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-2xl font-black text-black">{s.value}</p>
            <p className="text-[11.5px] uppercase tracking-wide text-black/50">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Category icons */}
      <div className="px-8 py-14 sm:px-14">
        <div className="mb-8 flex items-baseline justify-between">
          <h2 className="text-2xl font-black">Shop by Category</h2>
          <span className="text-[12.5px] font-semibold text-red-600">View All Categories →</span>
        </div>
        <div className="flex flex-wrap justify-center gap-8 sm:justify-between">
          {CATEGORIES.map((cat) => (
            <div key={cat.name} className="flex flex-col items-center gap-2.5">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black sm:h-24 sm:w-24">
                <span className="px-2 text-center text-[10px] font-black uppercase leading-tight text-white">{cat.name}</span>
              </div>
              <p className="text-[12.5px] font-semibold">{cat.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Course sections */}
      {CATEGORIES.map((cat, ci) => (
        <div key={cat.name} className={`px-8 py-14 sm:px-14 ${ci % 2 === 1 ? "bg-white" : ""}`}>
          <div className="mb-8 flex items-baseline justify-between">
            <h2 className="text-2xl font-black">{cat.name}</h2>
            <span className="text-[12.5px] font-semibold text-red-600">View All →</span>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cat.courses.map((course) => (
              <div key={course.title} className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white">
                {(course.verified || course.flagged) && (
                  <span
                    className={`absolute left-3 top-3 z-10 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white ${
                      course.flagged ? "bg-black" : "bg-red-600"
                    }`}
                  >
                    {course.flagged ? "Flagged" : "Verified"}
                  </span>
                )}
                <div className="relative flex aspect-video items-center justify-center bg-[#efece2]">
                  <span className="px-4 text-center text-[13px] font-bold uppercase leading-tight text-black/50">{course.title}</span>
                  <div className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                    <span className="text-xs">♡</span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="mb-1 text-[13.5px] font-semibold leading-snug">{course.title}</p>
                  <p className="mb-2 text-[11.5px] text-black/50">{course.provider}</p>
                  <div className="mb-2 flex items-center gap-1.5">
                    <Stars rating={course.rating} />
                    <span className="text-[11px] text-black/45">({course.reviewCount})</span>
                  </div>
                  <p className="text-[15px] font-black">
                    {course.price}
                    {course.recurring && <span className="text-[11px] font-normal text-black/50">/mo</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Footer */}
      <div className="bg-white px-8 py-16 sm:px-14">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-5">
          <div className="col-span-2">
            <img src="/logo-light.png" alt="No BS Courses" className="mb-4 h-6 w-auto" />
            <p className="max-w-[32ch] text-[12.5px] leading-relaxed text-black/55">
              Verified reviews from people who actually paid — not marketing copy dressed up as a rating.
            </p>
          </div>
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.head}>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.1em] text-black/50">{col.head}</p>
              {col.links.map((l) => (
                <span key={l} className="mb-2.5 block text-[13px] text-black/70">
                  {l}
                </span>
              ))}
            </div>
          ))}
        </div>
        <div className="mt-14 border-t border-black/10 pt-6 text-[11.5px] text-black/45">
          © 2026 No BS Courses. Verified reviews since day one.
        </div>
      </div>
    </div>
  );
}
