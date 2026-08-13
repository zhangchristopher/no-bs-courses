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
} from "lucide-react";
import { categorySlug, getCategoryShowcases } from "@/lib/courses";
import { SITE_NAME } from "@/lib/site";
import BSMark from "@/components/BSMark";

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
    <p className={`text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-500 ${className}`}>
      {children}
    </p>
  );
}

export default async function Home() {
  const categories = await getCategoryShowcases();

  return (
    <main className="flex flex-1 flex-col">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
        <BSMark
          size={880}
          className="pointer-events-none absolute -right-48 -top-40 hidden opacity-[0.06] sm:block dark:opacity-[0.09] dark:invert"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
              No BS. Just verified reviews.
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tighter text-zinc-900 sm:text-6xl lg:text-7xl dark:text-zinc-50">
              One course. <span className="text-red-600">One new career.</span> A fraction
              of the cost.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-zinc-400">
              MIT, Harvard, and Stanford already publish real lectures online — much of it
              free. The knowledge was never locked behind a $160,000 degree. The debt was.{" "}
              {SITE_NAME} helps you find which online courses actually teach it well, before
              you spend your money or your time finding out the hard way.
            </p>
            <div className="mt-10">
              <Link
                href="/courses"
                className="inline-block w-full rounded-full bg-red-600 px-8 py-4 text-center text-base font-semibold text-white shadow-sm transition hover:bg-red-700 hover:shadow-md active:scale-[0.98] sm:w-auto"
              >
                Browse verified courses
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-red-600" /> Verified-purchase
                reviews only
              </span>
              <span className="inline-flex items-center gap-2">
                <Ban className="h-4 w-4 shrink-0 text-red-600" /> Zero pay-to-rank
              </span>
              <span className="inline-flex items-center gap-2">
                <UserCheck className="h-4 w-4 shrink-0 text-red-600" /> Every review tied to
                a real account
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM — always dark, regardless of site theme: the hard-truth section */}
      <section className="bg-zinc-950 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <Eyebrow>The Problem</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Finding a course isn&apos;t the hard part. Knowing if it&apos;s any good is.
            </h2>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
            {PROBLEMS.map((p) => (
              <div
                key={p.title}
                className="rounded-lg border-t-2 border-red-600 bg-zinc-900 p-6 transition hover:-translate-y-0.5 hover:bg-zinc-800"
              >
                <p.icon className="h-6 w-6 text-red-500" strokeWidth={2} />
                <h3 className="mt-4 font-semibold text-white">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLEDGE — the manifesto: leans hardest into the brand */}
      <section className="bg-red-600 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-red-100">
              The Pledge
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Here&apos;s what we will never do.
            </h2>
            <p className="mt-4 text-red-50">
              Not a mission statement. A description of how the system is actually built.
            </p>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-lg bg-red-500/40 sm:grid-cols-2">
            {PLEDGES.map((p) => (
              <div key={p.title} className="flex gap-4 bg-red-600 p-6 sm:p-8">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
                  <p.icon className="h-5 w-5 text-red-600" strokeWidth={2.5} />
                </span>
                <div>
                  <h3 className="font-bold text-white">{p.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-red-50">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTION — the clean, documented proof */}
      <section className="bg-white py-20 sm:py-24 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <Eyebrow>The System</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
              Real learners. Real reviews. No pay-to-rank.
            </h2>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
              This is exactly how {SITE_NAME} keeps its ratings honest — not a marketing
              promise, the actual system.
            </p>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="flex gap-4 rounded-lg border border-zinc-200 p-6 transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:hover:border-zinc-700"
              >
                <f.icon className="h-6 w-6 shrink-0 text-red-600" strokeWidth={2} />
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
      <section className="bg-zinc-50 py-20 sm:py-24 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Eyebrow>Browse</Eyebrow>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            Find your next course
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {categories.map((c) => (
              <Link
                key={c.category}
                href={`/courses/category/${categorySlug(c.category)}`}
                className="group overflow-hidden rounded-lg border border-zinc-200 bg-white transition hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="relative h-40 w-full bg-zinc-100 dark:bg-zinc-800">
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

      {/* FINAL CTA */}
      <section className="bg-black py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Stop guessing. Start learning.
          </h2>
          <p className="mt-4 text-zinc-400">
            Every review here comes from someone who paid for the course and stuck around
            long enough to know if it was worth it.
          </p>
          <div className="mt-8">
            <Link
              href="/courses"
              className="inline-block w-full rounded-full bg-red-600 px-8 py-4 text-base font-semibold text-white transition hover:bg-red-700 active:scale-[0.98] sm:w-auto"
            >
              Browse verified courses
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
