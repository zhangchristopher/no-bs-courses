import Link from "next/link";
import { headers } from "next/headers";
import { SITE_NAME } from "@/lib/site";

export default async function SiteFooter() {
  // Style-preview routes render their own footer.
  const pathname = (await headers()).get("x-pathname") ?? "";
  if (pathname.startsWith("/style-preview")) return null;

  return (
    <footer className="border-t border-hairline bg-cream py-8 dark:border-hairline-dark dark:bg-cream-dark">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 text-[13px] uppercase tracking-eyebrow text-ink/50 sm:px-6 lg:px-8 dark:text-ink-dark/50">
        <span>
          &copy; {new Date().getFullYear()} {SITE_NAME}
        </span>
        <nav className="flex items-center gap-6">
          <Link href="/privacy" className="hover:text-ink dark:hover:text-ink-dark">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-ink dark:hover:text-ink-dark">
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}
