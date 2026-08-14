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
  ShieldCheck,
  UserCheck,
  ArrowRight,
} from "lucide-react";
import { categorySlug, getCategoryShowcases } from "@/lib/courses";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "One Course. One New Career. No BS.",
  description:
    "MIT, Harvard, and Stanford already publish real lectures online for free. The gatekeeping was never the knowledge — it was the $40,000 price tag. No BS Courses verifies which online courses actually deliver, with real reviews from real, verified learners.",
};

const PROBLEMS = [
  {
    icon: Layers,
    title: "There are thousands of options",
    body: "Search “learn Python” and you'll get tens of thousands of results. Every single one claims to be the best.",
  },
  {
    icon: Megaphone,
    title: "Every course sounds amazing",
    body: "Marketing pages are written to sell, not to tell you the truth. The testimonials on them were picked because they're glowing — not because they're representative.",
  },
  {
    icon: HelpCircle,
    title: "You find out too late",
    body: "There's no reliable, unbiased way to know if a course actually delivers — until you've already paid for it and burned the hours.",
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
    body: "No fabricated conversion rates. If we don't have the real signal, we say so — in the product, not just here.",
  },
  {
    icon: EyeOff,
    title: "Providers can't hide a review they don't like.",
    body: "There's no delete button for that. They can respond — but only once they're verified.",
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
    body: "A review only gets a “Verified” badge once the reviewer proves they actually bought the course — not just clicked a link.",
  },
  {
    icon: MessageSquare,
    title: "Owners can respond — but only once verified",
    body: "Course providers can only reply to reviews after signing a contract and getting their affiliate link admin-approved. No anonymous damage control.",
  },
  {
    icon: FileWarning,
    title: "We don't fabricate what we can't measure",
    body: "We don't have real signal on completed purchases across every platform out there, so we don't invent a fake conversion-rate number just to look impressive.",
  },
  {
    icon: BarChart3,
    title: "Every score shows its sample size",
    body: "We show the total review count next to every rating, so a 5.0 from one review reads differently than a 5.0 from fifty.",
  },
];

const CATEGORY_BLURBS: Record<string, string> = {
  "Web Development": "From your first line of code to a job-ready portfolio.",
  "Data Science": "Turn spreadsheets and guesswork into decisions backed by data.",
  Design: "Learn to design interfaces people actually want to use.",
};

function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-xs font-bold uppercase tracking-[0.2em] text-red-600 dark:text-red-500 ${className}`}>
      {children}
    </p>
  );
}

export default async function Home() {
  const categories = await getCategoryShowcases();

  return (
    <main className="flex flex-1 flex-col">
      {/* HERO — always dark, regardless of site theme: this is the one section
          built to showcase the custom generated art, and dark/red art reads
          badly dropped onto a white background. Matches the same
          "always dark" pattern already used below for Problem/Pledge/CTA. */}
      <section className="relative isolate overflow-hidden bg-black">
        <Image
          src="/homepage/hero-bg.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-44">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-md border border-red-900 bg-red-950/50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-red-400">
              No BS. Just verified reviews.
            </span>
            <h1 className="mt-6 text-5xl font-black leading-[0.97] tracking-[-0.03em] text-white sm:text-7xl lg:text-[5.5rem]">
              One course.
              <br />
              <span className="text-red-500">One new career.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
              MIT, Harvard, and Stanford already publish real lectures online — much of it
              free. The knowledge was never locked behind a $160,000 degree. The debt was.{" "}
              {SITE_NAME} helps you find which online courses actually teach it well, before
              you spend your money or your time finding out the hard way.
            </p>
            <div className="mt-10">
              <Link
                href="/courses"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-md bg-red-600 px-8 py-4 text-center text-sm font-bold uppercase tracking-[0.1em] text-white transition hover:bg-red-500 active:scale-[0.98] sm:w-auto"
              >
                See the real reviews
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm font-medium text-zinc-400">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-red-500" /> Verified-purchase
                reviews only
              </span>
              <span className="inline-flex items-center gap-2">
                <Ban className="h-4 w-4 shrink-0 text-red-500" /> Zero pay-to-rank
              </span>
              <span className="inline-flex items-center gap-2">
                <UserCheck className="h-4 w-4 shrink-0 text-red-500" /> Every review tied to
                a real account
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM — always dark, regardless of site theme: the hard-truth section */}
      <section className="bg-zinc-950 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <Eyebrow>The Problem</Eyebrow>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">
              Finding a course isn&apos;t the hard part. Knowing if it&apos;s any good is.
            </h2>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden bg-zinc-800 sm:grid-cols-3">
            {PROBLEMS.map((p) => (
              <div
                key={p.title}
                className="border-t-4 border-red-600 bg-zinc-950 p-8 transition hover:bg-zinc-900"
              >
                <p.icon className="h-6 w-6 text-red-500" strokeWidth={2.5} />
                <h3 className="mt-4 font-semibold text-white">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLEDGE — the manifesto: leans hardest into the brand, custom art on the right */}
      <section className="bg-red-600 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-100">
                The Pledge
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">
                Here&apos;s what we will never do.
              </h2>
              <p className="mt-4 max-w-xl text-red-50">
                Not a mission statement. A description of how the system is actually built.
              </p>
              <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden bg-red-500/40 sm:grid-cols-2">
                {PLEDGES.map((p) => (
                  <div key={p.title} className="flex gap-4 bg-red-600 p-6 sm:p-7">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/30 bg-white">
                      <p.icon className="h-4 w-4 text-red-600" strokeWidth={2.5} />
                    </span>
                    <div>
                      <h3 className="font-bold text-white">{p.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-red-50">{p.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative hidden aspect-4/5 overflow-hidden rounded-md border border-white/10 lg:block">
              <Image
                src="/homepage/pledge-visual.png"
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
      <section className="bg-white py-20 sm:py-28 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <Eyebrow>The System</Eyebrow>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
              Real learners. Real reviews. No pay-to-rank.
            </h2>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
              This is exactly how {SITE_NAME} keeps its ratings honest — not a marketing
              promise, the actual system.
            </p>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden bg-zinc-200 sm:grid-cols-2 dark:bg-zinc-800">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex gap-4 bg-white p-8 transition hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900"
              >
                <f.icon className="h-6 w-6 shrink-0 text-red-600" strokeWidth={2.5} />
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{f.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {f.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORY BROWSE */}
      <section className="bg-zinc-50 py-20 sm:py-28 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Eyebrow>Browse</Eyebrow>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
            Find your next course
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden bg-zinc-200 sm:grid-cols-3 dark:bg-zinc-800">
            {categories.map((c) => (
              <Link
                key={c.category}
                href={`/courses/category/${categorySlug(c.category)}`}
                className="group bg-white transition hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900"
              >
                <div className="relative h-40 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
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
                  <h3 className="font-semibold text-zinc-900 transition group-hover:text-red-600 dark:text-zinc-50">
                    {c.category}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {CATEGORY_BLURBS[c.category] ?? "Compare courses side by side."}
                  </p>
                  <p className="mt-3 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                    {c.count} course{c.count === 1 ? "" : "s"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA — always dark, with a low-opacity ambient texture from the
          custom art (subtle by design, not competing with the type) */}
      <section className="relative isolate overflow-hidden bg-black py-20 sm:py-28">
        <Image
          src="/homepage/cta-bg.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/60 to-black" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
            Stop guessing. Start learning.
          </h2>
          <p className="mt-4 text-zinc-400">
            Every review here comes from someone who paid for the course and stuck around
            long enough to know if it was worth it.
          </p>
          <div className="mt-8">
            <Link
              href="/courses"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-red-600 px-8 py-4 text-sm font-bold uppercase tracking-[0.1em] text-white transition hover:bg-red-500 active:scale-[0.98] sm:w-auto"
            >
              See the real reviews
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
