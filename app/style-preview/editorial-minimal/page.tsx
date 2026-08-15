import {
  HERO_HEADLINE_PRE,
  HERO_HEADLINE_ACCENT,
  HERO_HEADLINE_POST,
  HERO_SUBHEAD,
  CATEGORIES,
  FOOTER_COLUMNS,
  type PreviewCategory,
  type PreviewCourse,
} from "@/lib/style-preview-data";
import { CategoryIcon, ClaimIcon, HeartIcon } from "@/components/icons";

export const metadata = { title: "Style Preview — Editorial Minimal" };

// Sourced from the shared --color-cream token (app/globals.css) rather than
// a local hex, now that the site's real light palette is this same cream.
const CREAM = "var(--color-cream)";

const CLAIMS = [
  "Verified-purchase reviews only",
  "Zero pay-to-rank listings",
  "Real accounts, no drive-by ratings",
  "Every listing checked before it's live",
];

const NAV_LINKS = ["Home", "Courses", "Categories", "About"];

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="text-[11px] tracking-wide text-black tabular-nums">
      {"★★★★★".slice(0, full)}
      <span className="text-black/25">{"★★★★★".slice(full)}</span>
    </span>
  );
}

function HeroHeadline({ scale }: { scale: "mobile" | "desktop" }) {
  return (
    <>
      <h1
        className={
          scale === "mobile"
            ? "mb-4 text-[28px] font-black uppercase leading-[1.05] tracking-tight"
            : "mb-4 text-[32px] font-black uppercase leading-[1.05] tracking-tight"
        }
      >
        {HERO_HEADLINE_PRE} <span className="whitespace-nowrap">{HERO_HEADLINE_ACCENT}</span> {HERO_HEADLINE_POST}
      </h1>
      <div className="flex flex-wrap items-center gap-5">
        <button className="bg-black px-6 py-3 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-black/80">
          See The Real Reviews
        </button>
        <a href="#" className="border-b border-black/40 text-[11.5px] font-semibold uppercase tracking-[0.08em] transition-colors hover:border-black">
          Browse Courses
        </a>
      </div>
    </>
  );
}

// Picks the strongest non-flagged course in a category to lead its grid —
// rendered larger so 20 otherwise-identical cards gain one real focal point,
// giving a fast-comparison shopper something to anchor on.
function pickFeatured(courses: PreviewCourse[]): PreviewCourse {
  return [...courses].filter((c) => !c.flagged).sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)[0] ?? courses[0];
}

function CourseCard({ course, cat, featured }: { course: PreviewCourse; cat: PreviewCategory; featured: boolean }) {
  return (
    <div className={`group ${featured ? "sm:col-span-2" : ""}`}>
      <div
        className={`relative mb-3 flex items-center justify-center overflow-hidden border border-black/10 bg-white ${
          featured ? "aspect-[21/9]" : "aspect-video"
        }`}
      >
        <CategoryIcon name={cat.name} className="pointer-events-none absolute -bottom-5 -right-5 h-28 w-28 text-black/[0.06]" />
        {(course.verified || course.flagged) && (
          <span
            className={
              course.flagged
                ? "absolute left-2.5 top-2.5 z-10 bg-black px-2 py-1 text-[9.5px] font-bold uppercase tracking-[0.08em] text-white"
                : "absolute left-2.5 top-2.5 z-10 border border-black bg-white px-2 py-1 text-[9.5px] font-bold uppercase tracking-[0.08em] text-black"
            }
          >
            {course.flagged ? "Flagged" : "Verified"}
          </span>
        )}
        <button
          type="button"
          aria-label={`Save ${course.title}`}
          className="absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center text-black/40 transition-colors hover:text-black"
        >
          <HeartIcon className="h-[15px] w-[15px]" />
        </button>
        <span className="relative z-[1] px-4 text-center text-[13px] font-bold uppercase leading-tight text-black/70 transition-transform duration-300 ease-out group-hover:scale-[1.04]">
          {course.title}
        </span>
      </div>
      <div className="flex items-start justify-between gap-2">
        <div>
          <a href="#" className="text-[13.5px] font-semibold leading-snug hover:underline">
            {course.title}
          </a>
          <p className="text-[11.5px] text-black/55">{course.provider}</p>
        </div>
        <p className="whitespace-nowrap text-[13.5px] font-semibold tabular-nums">
          {course.price}
          {course.recurring && <span className="text-[10px] font-normal text-black/55">/mo</span>}
        </p>
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <Stars rating={course.rating} />
        <span className="text-[11px] tabular-nums text-black/55">({course.reviewCount})</span>
      </div>
    </div>
  );
}

function CourseSection({ cat }: { cat: PreviewCategory }) {
  const featured = pickFeatured(cat.courses);
  const ordered = [featured, ...cat.courses.filter((c) => c !== featured)];
  return (
    <div className="border-t border-black/10 px-8 py-14 sm:px-14">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-baseline justify-between">
          <h2 className="text-2xl font-black uppercase tracking-tight">{cat.name}</h2>
          <a href="#" className="border-b border-black/40 text-[12px] font-semibold uppercase tracking-[0.08em] transition-colors hover:border-black">
            View All
          </a>
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {ordered.map((course) => (
            <CourseCard key={course.title} course={course} cat={cat} featured={course.title === featured.title} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function EditorialMinimalPreview() {
  const [firstCategory, ...restCategories] = CATEGORIES;

  return (
    <div style={{ background: CREAM }} className="edt-min text-black">
      <style>{`
        .edt-min ::selection { background: #000; color: ${CREAM}; }
        .edt-min :focus-visible { outline: 2px solid #000; outline-offset: 3px; }
        .edt-min .on-dark:focus-visible { outline-color: #fff; }
        .edt-min { scrollbar-color: #000 ${CREAM}; scrollbar-width: thin; }
        .edt-min ::-webkit-scrollbar { width: 10px; height: 10px; }
        .edt-min ::-webkit-scrollbar-track { background: ${CREAM}; }
        .edt-min ::-webkit-scrollbar-thumb { background: #000; border: 2px solid ${CREAM}; }
      `}</style>

      {/* Utility bar */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 bg-black px-4 py-2 text-center text-[10.5px] uppercase tracking-[0.1em] text-white/85 sm:justify-between sm:px-14">
        <span>Verified Reviews Only · No Pay-to-Rank · Admin-Reviewed Listings</span>
        <span className="hidden sm:inline">Help · Sign In</span>
      </div>

      {/* Nav — links stay visible at every width; desktop keeps the single
          masthead row, mobile drops them to a wrapped second row instead
          of hiding them behind a menu that doesn't exist. */}
      <div className="border-b border-black/10 px-8 py-6 sm:px-14">
        <div className="flex items-center justify-between gap-4">
          <img src="/logo-light.png" alt="No BS Courses" className="h-6 w-auto" />
          <div className="hidden gap-10 text-[13px] tracking-wide sm:flex">
            {NAV_LINKS.map((label, i) => (
              <a
                key={label}
                href="#"
                className={
                  i === 0
                    ? "border-b-2 border-black pb-0.5"
                    : "border-b-2 border-transparent pb-0.5 transition-colors hover:border-black/30"
                }
              >
                {label}
              </a>
            ))}
          </div>
          <button className="rounded-none bg-black px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-black/80">
            Sign Up
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[12px] tracking-wide sm:hidden">
          {NAV_LINKS.map((label, i) => (
            <a
              key={label}
              href="#"
              className={i === 0 ? "border-b-2 border-black pb-0.5" : "border-b-2 border-transparent pb-0.5 text-black/70"}
            >
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* Hero stage — giant wordmark with the photo layered on top of it.
          The headline overlays the stage from sm: up, where there's room
          beside the photo; below that it drops to normal flow underneath
          the stage instead of overlapping the image. */}
      <div className="relative h-[320px] overflow-hidden sm:h-[560px]">
        <div
          aria-hidden
          className="absolute inset-0 flex select-none items-center justify-center whitespace-nowrap text-[26vw] font-black uppercase leading-none tracking-[-0.04em] text-black sm:text-[16vw]"
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

        <p className="absolute right-6 top-6 z-20 text-[11px] font-semibold uppercase tracking-[0.22em] text-black/60 sm:right-14 sm:top-10">
          Verified Since 2026
        </p>

        <div className="hidden sm:absolute sm:bottom-12 sm:left-14 sm:z-20 sm:block sm:max-w-[300px]">
          <HeroHeadline scale="desktop" />
        </div>
      </div>

      {/* Mobile headline — normal flow, no overlap with the photo above. */}
      <div className="border-b border-black/10 px-6 py-8 sm:hidden">
        <HeroHeadline scale="mobile" />
      </div>

      {/* Subhead */}
      <div className="hidden border-b border-black/10 px-8 py-8 sm:block sm:px-14">
        <p className="mx-auto max-w-[52ch] text-center text-[14.5px] leading-relaxed text-black/70">{HERO_SUBHEAD}</p>
      </div>

      {/* Category strip — bespoke line icons carry the visual weight photography
          would in a fashion reference; text-in-a-box is gone. */}
      <div className="border-b border-black/10 bg-black px-8 py-12 sm:px-14">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 sm:grid-cols-4">
          {CATEGORIES.map((cat) => (
            <a key={cat.name} href="#" className="on-dark group block">
              <div className="mb-5 flex aspect-square items-center justify-center border border-white/15 bg-[#141414] transition-colors duration-300 group-hover:border-white/40">
                <CategoryIcon
                  name={cat.name}
                  className="h-9 w-9 text-white transition-transform duration-300 ease-out group-hover:scale-110 sm:h-11 sm:w-11"
                />
              </div>
              <p className="text-[12.5px] font-semibold uppercase tracking-[0.04em] text-white">{cat.name}</p>
              <p className="text-[11.5px] text-white/60">Shop {cat.courses.length} verified courses →</p>
            </a>
          ))}
        </div>
      </div>

      {/* Fact strip — single line, no icon-card grid, now carrying the same
          stroke-icon language as the rest of the page. */}
      <div className="border-b border-black/10 bg-black px-8 py-6 sm:px-14">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-y-3 text-center">
          {CLAIMS.map((claim, i) => (
            <div key={claim} className="flex items-center">
              {i > 0 && <span aria-hidden className="mx-6 hidden h-3 w-px bg-white/20 sm:block" />}
              <span className="flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.05em] text-white/85">
                <ClaimIcon index={i} className="h-3.5 w-3.5 shrink-0" />
                {claim}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* First course section, then the second editorial gesture as a payoff
          further down the page instead of an immediate rerun of the hero. */}
      <CourseSection cat={firstCategory} />

      {/* Second gesture — mirrors the hero's photo-plus-display-type device,
          given a distinct grayscale treatment so it reads as a deliberate
          callback rather than the same photo shown twice in a row. */}
      <div className="border-y border-black/10 px-8 py-14 sm:px-14 sm:py-0">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 sm:grid-cols-2 sm:gap-16">
          <div className="order-2 aspect-[4/5] overflow-hidden sm:order-1 sm:aspect-auto sm:h-[440px]">
            <img
              src="/style-preview/sheep-hero-realistic.jpg"
              alt="A black sheep standing apart from the flock, close crop"
              className="h-full w-full object-cover grayscale contrast-125"
              style={{ objectPosition: "30% 35%" }}
            />
          </div>
          <div className="order-1 sm:order-2">
            <h2 className="mb-5 text-[40px] font-black uppercase leading-[0.95] tracking-[-0.03em] sm:text-[64px]">
              The scores
              <br />
              aren&apos;t for
              <br />
              sale.
            </h2>
            <p className="mb-7 max-w-[38ch] text-[14.5px] leading-relaxed text-black/70">
              Every rating on this page comes from someone who paid and finished the course. No sponsored
              placement, no boosted rankings.
            </p>
            <a href="#" className="border-b border-black/40 text-[11.5px] font-semibold uppercase tracking-[0.08em] transition-colors hover:border-black">
              See How Verification Works →
            </a>
          </div>
        </div>
      </div>

      {/* Remaining course sections */}
      {restCategories.map((cat) => (
        <CourseSection key={cat.name} cat={cat} />
      ))}

      {/* Footer */}
      <div className="border-t border-black/10 px-8 py-16 sm:px-14">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 sm:grid-cols-5">
          <div className="col-span-2">
            <img src="/logo-light.png" alt="No BS Courses" className="mb-4 h-6 w-auto" />
            <p className="max-w-[32ch] text-[12.5px] leading-relaxed text-black/60">
              Verified reviews from people who actually paid — not marketing copy dressed up as a rating.
            </p>
          </div>
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.head}>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-black/55">{col.head}</p>
              {col.links.map((l) => (
                <a key={l} href="#" className="mb-2.5 block text-[13px] text-black/70 transition-colors hover:text-black hover:underline">
                  {l}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div className="mx-auto mt-14 max-w-6xl border-t border-black/10 pt-6 text-[11.5px] text-black/50">
          © 2026 No BS Courses. Verified reviews since day one.
        </div>
      </div>
    </div>
  );
}
