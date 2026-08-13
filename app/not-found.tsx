import Link from "next/link";
import type { Metadata } from "next";
import BSMark from "@/components/BSMark";

export const metadata: Metadata = { title: "Page Not Found" };

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-sm flex-1 flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
      <BSMark size={64} className="opacity-80" />
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        This page doesn&apos;t exist.
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        No BS here either — it&apos;s just a bad link or a page that moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Back to home
      </Link>
    </main>
  );
}
