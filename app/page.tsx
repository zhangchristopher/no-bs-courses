import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  BadgeCheck,
  MessageSquare,
  FileWarning,
  BarChart3,
  Ban,
  Scale,
  EyeOff,
  Lock,
  Layers,
  Megaphone,
  HelpCircle,
} from "lucide-react";
import { categorySlug, getCategoryShowcases, getSiteFeaturedCourse } from "@/lib/courses";
import { ArrowIcon, ClaimIcon } from "@/components/icons";
import FeaturedCourseCard from "@/components/FeaturedCourseCard";

export const metadata: Metadata = {
  title: "The Right Course For You. No BS.",
  description:
    "Nobody knows which course is BS and which one might change your life — until now. No BS Courses verifies which online courses actually deliver, with real reviews from real, verified learners.",
};

const PROBLEMS = [
  {
    icon: Layers,
    title: "There are thousands of options",
    body: "Everyone shows themselves as the expert, but who actually is? Every single one claims to be the best.",
  },
  {
    icon: Megaphone,
    title: "Every course sounds amazing",
    body: "Marketing pages are written to sell, not to tell you the truth. Many of the testimonials are paid for, not genuine.",
  },
  {
    icon: HelpCircle,
    title: "You find out too late",
    body: "There's no reliable, unbiased way to know if a course delivers, until you're out $1,000 and a month of your time.",
  },
];

const PLEDGES = [
  {
    icon: Scale,
    title: "A course can't pay for a better score.",
    body: "Ratings are computed only from reviews. Registered Business and Verified Course status never touch the number.",
  },
  {
    icon: Ban,
    title: "We don't publish stats we can't back up.",
    body: "No fabricated data. If we don't have the real signal, we won't show it to you.",
  },
  {
    icon: EyeOff,
    title: "Providers can't hide a review they don't like.",
    body: "There's no delete button for that. If it's bad, we'll know.",
  },
  {
    icon: Lock,
    title: "Reviews lock 48 hours after posting.",
    body: "No quietly editing a bad review into a good one later. Once the window closes, not even we can touch it.",
  },
];

const FEATURES = [
  {
    icon: BadgeCheck,
    title: "Verified-purchase reviews",
    body: "A review gets a “Verified” badge once they prove they actually bought the course.",
  },
  {
    icon: MessageSquare,
    title: "Owners can respond, after verification",
    body: "Course providers can only reply to reviews after signing a contract and getting approved. No anonymous damage control.",
  },
  {
    icon: FileWarning,
    title: "We don't make money unless you do",
    body: "For verified courses, we only make money through designated affiliate links.",
  },
  {
    icon: BarChart3,
    title: "Every score shows its sample size",
    body: "We show the total review count for every rating, so you know what you're getting.",
  },
];

const CATEGORY_BLURBS: Record<string, string> = {
  "Web Development": "From your first line of code to a job-ready portfolio.",
  "Data Science": "Turn spreadsheets and guesswork into decisions backed by data.",
  Design: "Learn to design interfaces people actually want to use.",
};

export default async function Home() {
  const categories = await getCategoryShowcases();
  const featuredCourse = await getSiteFeaturedCourse();

  return (
    <main className="flex flex-1 flex-col">
      {/* HERO — follows site theme like every other section (white in light,
          charcoal in dark). The sheep art is a transparent PNG rather than a
          full-bleed photo, so it sits as a right-aligned graphic over the
          flat section background instead of needing a scrim/gradient to
          keep text legible. */}
      <section className="relative isolate overflow-hidden bg-cream dark:bg-cream-dark">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[52%] lg:block">
          <Image
            src="/brand/hero-sheep.png"
            alt=""
            fill
            priority
            sizes="52vw"
            className="object-contain object-right"
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-44">
          <div className="max-w-3xl">
            <span className="inline-flex items-center border border-ink/30 px-3 py-1 text-[11px] font-bold uppercase tracking-eyebrow text-ink dark:border-ink-dark/30 dark:text-ink-dark">
              Just verified reviews.
            </span>
            <h1 className="mt-6 text-5xl font-black uppercase leading-[0.97] tracking-display text-ink dark:text-ink-dark sm:text-7xl lg:text-[5.5rem]">
              The right course
              <br />
              for you. No BS.
            </h1>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-ink/60 dark:text-ink-dark/60 sm:text-lg">
              Nobody knows which course is BS and which ones might change your life. Well, not
              anymore. Finding the black sheep should be easy anyway, right?
            </p>
            <div className="mt-10">
              <Link
                href="/courses"
                className="group inline-flex w-full items-center justify-center gap-2 bg-ink px-8 py-4 text-center text-sm font-bold uppercase tracking-label text-cream transition hover:bg-ink/80 active:scale-[0.98] dark:bg-ink-dark dark:text-cream-dark dark:hover:bg-ink-dark/80 sm:w-auto"
              >
                See the real reviews
                <ArrowIcon className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm font-medium text-ink/60 dark:text-ink-dark/60">
              <span className="inline-flex items-center gap-2">
                <ClaimIcon index={0} className="h-4 w-4 shrink-0 text-ink dark:text-ink-dark" />{" "}
                Verified-purchase reviews only
              </span>
              <span className="inline-flex items-center gap-2">
                <ClaimIcon index={1} className="h-4 w-4 shrink-0 text-ink dark:text-ink-dark" /> Zero
                pay-to-rank
              </span>
              <span className="inline-flex items-center gap-2">
                <ClaimIcon index={2} className="h-4 w-4 shrink-0 text-ink dark:text-ink-dark" /> Every
                review tied to a real account
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM — a slight tint (not a flat repeat of the hero's plain
          ground) so the two sections stay visually distinct without either
          one breaking theme. No eyebrow above the heading: the heading
          carries its own weight. */}
      <section className="bg-ink/[0.03] py-20 dark:bg-ink-dark/[0.04] sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-black uppercase tracking-headline text-ink dark:text-ink-dark sm:text-5xl">
              Finding a course isn&apos;t the hard part. Knowing if it&apos;s any good is.
            </h2>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden bg-hairline dark:bg-hairline-dark sm:grid-cols-3">
            {PROBLEMS.map((p) => (
              <div
                key={p.title}
                className="border-t-2 border-ink bg-cream p-8 transition hover:bg-ink/[0.03] dark:border-ink-dark dark:bg-cream-dark dark:hover:bg-ink-dark/[0.04]"
              >
                <p.icon className="h-6 w-6 text-ink dark:text-ink-dark" strokeWidth={1.5} />
                <h3 className="mt-4 font-semibold uppercase tracking-tight text-ink dark:text-ink-dark">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/55 dark:text-ink-dark/55">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLEDGE — the manifesto. Flips to the light cream ground (rather
          than repeating the dark hero/problem treatment a third time) so
          the page keeps a dark/dark/light/light/light/dark rhythm instead
          of flattening into one long dark run. */}
      <section className="bg-cream py-20 sm:py-28 dark:bg-cream-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-headline text-ink dark:text-ink-dark sm:text-5xl">
                Here&apos;s what we will never do.
              </h2>
              <p className="mt-4 max-w-xl text-ink/60 dark:text-ink-dark/60">
                Check the{" "}
                <Link href="/terms#reviews-content" className="underline hover:no-underline">
                  policies
                </Link>
                . We don&apos;t do BS.
              </p>
              <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden bg-hairline dark:bg-hairline-dark sm:grid-cols-2">
                {PLEDGES.map((p) => (
                  <div key={p.title} className="flex gap-4 bg-cream p-6 dark:bg-cream-dark sm:p-7">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-ink dark:border-ink-dark">
                      <p.icon className="h-4 w-4 text-ink dark:text-ink-dark" strokeWidth={1.5} />
                    </span>
                    <div>
                      <h3 className="font-bold uppercase tracking-tight text-ink dark:text-ink-dark">{p.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ink/60 dark:text-ink-dark/60">{p.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative hidden aspect-4/5 overflow-hidden border border-hairline dark:border-hairline-dark lg:block">
              <Image
                src="/brand/pledge-sheep.png"
                alt=""
                fill
                sizes="(max-width: 1024px) 0px, 40vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SOLUTION — the clean, documented proof */}
      <section className="bg-cream py-20 sm:py-28 dark:bg-cream-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-black uppercase tracking-headline text-ink sm:text-5xl dark:text-ink-dark">
              Real learners. Real reviews. No pay-to-rank.
            </h2>
            <p className="mt-4 text-lg text-ink/60 dark:text-ink-dark/60">
              Your pockets can&apos;t hide your reviews.
            </p>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden bg-hairline sm:grid-cols-2 dark:bg-hairline-dark">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex gap-4 bg-cream p-8 transition hover:bg-ink/[0.03] dark:bg-cream-dark dark:hover:bg-ink-dark/[0.04]"
              >
                <f.icon className="h-6 w-6 shrink-0 text-ink dark:text-ink-dark" strokeWidth={1.5} />
                <div>
                  <h3 className="font-semibold uppercase tracking-tight text-ink dark:text-ink-dark">{f.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink/60 dark:text-ink-dark/60">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED COURSE — an admin pick, not a ranking. Only renders once
          one's been set from /admin/featured. */}
      {featuredCourse && (
        <section className="bg-cream py-20 sm:py-28 dark:bg-cream-dark">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black uppercase tracking-headline text-ink dark:text-ink-dark sm:text-5xl">
              Worth a look
            </h2>
            <div className="mt-10">
              <FeaturedCourseCard course={featuredCourse} />
            </div>
          </div>
        </section>
      )}

      {/* CATEGORY BROWSE */}
      <section className="bg-ink/[0.03] py-20 sm:py-28 dark:bg-ink-dark/[0.04]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black uppercase tracking-headline text-ink sm:text-5xl dark:text-ink-dark">
            Find your next course
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden bg-hairline sm:grid-cols-3 dark:bg-hairline-dark">
            {categories.map((c) => (
              <Link
                key={c.category}
                href={`/courses/category/${categorySlug(c.category)}`}
                className="group bg-cream transition hover:bg-ink/[0.03] dark:bg-cream-dark dark:hover:bg-ink-dark/[0.04]"
              >
                <div className="relative h-40 w-full overflow-hidden bg-ink/5 dark:bg-ink-dark/10">
                  {c.thumbnail_url && (
                    <Image
                      src={c.thumbnail_url}
                      alt={c.category}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-semibold uppercase tracking-tight text-ink transition group-hover:opacity-60 dark:text-ink-dark">
                    {c.category}
                  </h3>
                  <p className="mt-1 text-sm text-ink/50 dark:text-ink-dark/50">
                    {CATEGORY_BLURBS[c.category] ?? "Compare courses side by side."}
                  </p>
                  <p className="mt-3 text-[11px] font-medium uppercase tracking-label tabular-nums text-ink/40 dark:text-ink-dark/40">
                    {c.count} course{c.count === 1 ? "" : "s"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA — follows site theme, with a low-opacity ambient texture
          from the same grayscaled brand art */}
      <section className="relative isolate overflow-hidden bg-cream py-20 dark:bg-cream-dark sm:py-28">
        <Image
          src="/homepage/cta-bg.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-20 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-cream via-cream/60 to-cream dark:from-cream-dark dark:via-cream-dark/60 dark:to-cream-dark" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black uppercase tracking-headline text-ink dark:text-ink-dark sm:text-5xl">
            Stop guessing. Start learning.
          </h2>
          <p className="mt-4 text-ink/60 dark:text-ink-dark/60">
            Every review here comes from someone who paid for the course — unless it&apos;s
            free. (You&apos;re smart enough to figure that out.)
          </p>
          <div className="mt-8">
            <Link
              href="/courses"
              className="group inline-flex w-full items-center justify-center gap-2 bg-ink px-8 py-4 text-sm font-bold uppercase tracking-label text-cream transition hover:bg-ink/80 active:scale-[0.98] dark:bg-ink-dark dark:text-cream-dark dark:hover:bg-ink-dark/80 sm:w-auto"
            >
              See the real reviews
              <ArrowIcon className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
