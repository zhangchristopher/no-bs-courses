import { IBM_Plex_Mono } from "next/font/google";
import {
  STATS,
  CATEGORIES,
  ALL_COURSES,
  FOOTER_COLUMNS,
} from "@/lib/style-preview-data";

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata = { title: "Style Preview — Brutalist Audit" };

const mono = { fontFamily: "var(--font-plex-mono)" };

function StatusCell({ course }: { course: (typeof ALL_COURSES)[number] }) {
  if (course.flagged) {
    return (
      <span className="inline-flex items-center gap-1 text-red-600">
        <span aria-hidden>▲</span> FLAGGED
      </span>
    );
  }
  if (course.verified) {
    return (
      <span className="inline-flex items-center gap-1">
        <span aria-hidden className="text-red-600">✓</span> VERIFIED
      </span>
    );
  }
  return <span className="text-black/50">UNCLAIMED</span>;
}

export default function BrutalistAuditPreview() {
  return (
    <div className={plexMono.variable} style={mono}>
      <div className="min-h-screen bg-white text-black">
        {/* Nav */}
        <div className="flex items-center justify-between border-b-2 border-black px-6 py-4 sm:px-10">
          <span className="text-sm font-bold uppercase tracking-tight" style={mono}>
            NO_BS_COURSES
          </span>
          <div className="hidden gap-8 text-xs uppercase tracking-wide sm:flex">
            <span>[ COURSES ]</span>
            <span>[ CATEGORIES ]</span>
            <span>[ REVIEWS ]</span>
          </div>
          <span className="border-2 border-black px-3 py-1.5 text-xs font-bold uppercase">[ SIGN UP ]</span>
        </div>

        {/* Hero — blunt statement, no image */}
        <div className="border-b-2 border-black px-6 py-16 sm:px-10 sm:py-24">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.15em] text-black/60">DOC. NO. 2026-0814 — PUBLIC FILING</p>
          <h1 className="max-w-[20ch] text-[32px] font-bold uppercase leading-[1.15] tracking-tight sm:text-[48px]" style={mono}>
            MOST COURSES ARE OVERPRICED. HERE&apos;S WHICH ONES AREN&apos;T.
          </h1>
          <p className="mt-6 max-w-[70ch] text-sm leading-relaxed text-black/70">
            12,400 reviews here come from people who actually paid — not the crowd repeating marketing copy. Every listing below is filed
            with its verification status. No BS.
          </p>
        </div>

        {/* Summary metrics table */}
        <div className="grid grid-cols-1 border-b-2 border-black sm:grid-cols-3">
          {STATS.map((s, i) => (
            <div key={s.label} className={`px-6 py-6 sm:px-10 ${i > 0 ? "border-t-2 sm:border-l-2 sm:border-t-0 border-black" : ""}`}>
              <p className="text-[11px] font-bold uppercase tracking-wide text-black/50">{s.label.toUpperCase()}</p>
              <p className="mt-1 text-3xl font-bold tabular-nums">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search — literal form field */}
        <div className="border-b-2 border-black px-6 py-8 sm:px-10">
          <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.1em]" htmlFor="audit-search">
            SEARCH COURSES
          </label>
          <div className="flex max-w-xl">
            <input
              id="audit-search"
              type="text"
              placeholder="ENTER COURSE NAME, PROVIDER, OR KEYWORD"
              className="flex-1 border-2 border-black bg-white px-3 py-2.5 text-sm uppercase tracking-wide placeholder:text-black/35 focus:outline-none"
            />
            <button className="border-2 border-l-0 border-black bg-black px-5 text-xs font-bold uppercase text-white">SEARCH</button>
          </div>
        </div>

        {/* Ledger */}
        <div className="px-6 py-10 sm:px-10">
          <h2 className="mb-6 text-lg font-bold uppercase tracking-tight" style={mono}>
            LISTING LEDGER — {ALL_COURSES.length} ENTRIES
          </h2>
          {CATEGORIES.map((cat) => (
            <div key={cat.name} className="mb-10">
              <div className="border-b-2 border-black bg-black px-3 py-2">
                <span className="text-xs font-bold uppercase tracking-wide text-white">SECTION — {cat.name}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-[13px]">
                  <thead>
                    <tr className="border-b-2 border-black text-left text-[10.5px] uppercase tracking-wide text-black/60">
                      <th className="w-10 py-2 pr-2 font-normal">#</th>
                      <th className="py-2 pr-4 font-normal">COURSE</th>
                      <th className="py-2 pr-4 font-normal">PROVIDER</th>
                      <th className="py-2 pr-4 font-normal">DURATION</th>
                      <th className="py-2 pr-4 font-normal">PRICE</th>
                      <th className="py-2 pr-4 font-normal">SCORE</th>
                      <th className="py-2 pr-4 font-normal">STATUS</th>
                      <th className="py-2 text-right font-normal">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cat.courses.map((course, i) => (
                      <tr key={course.title} className="border-b border-black/15">
                        <td className="py-3 pr-2 tabular-nums text-black/50">{String(i + 1).padStart(2, "0")}</td>
                        <td className="py-3 pr-4 font-medium">{course.title}</td>
                        <td className="py-3 pr-4 text-black/70">{course.provider}</td>
                        <td className="py-3 pr-4 tabular-nums text-black/70">{course.duration}</td>
                        <td className="py-3 pr-4 tabular-nums">
                          {course.price}
                          {course.recurring ? "/mo" : ""}
                        </td>
                        <td className="py-3 pr-4 tabular-nums">
                          {course.rating.toFixed(1)} ({course.reviewCount})
                        </td>
                        <td className="py-3 pr-4">
                          <StatusCell course={course} />
                        </td>
                        <td className="py-3 text-right">
                          <span className="whitespace-nowrap font-bold">[ VIEW COURSE ]</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-black px-6 py-14 sm:px-10">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-5">
            <div className="col-span-2">
              <span className="mb-3 block text-sm font-bold uppercase tracking-tight" style={mono}>
                NO_BS_COURSES
              </span>
              <p className="max-w-[36ch] text-[12.5px] leading-relaxed text-black/60">
                Verified reviews from people who actually paid — not marketing copy dressed up as a rating.
              </p>
            </div>
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.head}>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.08em] text-black/50">{col.head.toUpperCase()}</p>
                {col.links.map((l) => (
                  <span key={l} className="mb-2 block text-[12.5px] text-black/75">
                    [ {l.toUpperCase()} ]
                  </span>
                ))}
              </div>
            ))}
          </div>
          <div className="mt-10 border-t-2 border-black pt-5 text-[11.5px] uppercase tracking-wide text-black/50">
            © 2026 NO BS COURSES. VERIFIED REVIEWS SINCE DAY ONE.
          </div>
        </div>
      </div>
    </div>
  );
}
