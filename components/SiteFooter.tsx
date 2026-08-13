import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 py-8 dark:border-zinc-800">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 text-sm text-zinc-500 sm:px-6 lg:px-8 dark:text-zinc-400">
        <span>
          &copy; {new Date().getFullYear()} {SITE_NAME}
        </span>
        <nav className="flex items-center gap-6">
          <Link href="/privacy" className="hover:text-zinc-900 dark:hover:text-zinc-50">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-zinc-900 dark:hover:text-zinc-50">
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}
