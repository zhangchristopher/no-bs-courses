import Link from "next/link";
import { headers } from "next/headers";
import { LEGAL_ENTITY_NAME } from "@/lib/site";
import Logo from "@/components/Logo";

const FOOTER_LINKS = [
  { href: "/courses", label: "Browse courses" },
  { href: "/courses/category", label: "All categories" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export default async function SiteFooter() {
  // Style-preview routes render their own footer.
  const pathname = (await headers()).get("x-pathname") ?? "";
  if (pathname.startsWith("/style-preview")) return null;

  return (
    <footer className="border-t border-hairline-dark bg-cream-dark pt-10 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[13px] uppercase tracking-eyebrow text-ink-dark/60">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-ink-dark">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* The wordmark as a closing statement — spans the full content
            column, the last thing on every page. */}
        <Logo className="mt-12 block w-full" imgClassName="block h-auto w-full" />

        <p className="mt-8 text-[12px] uppercase tracking-eyebrow text-ink-dark/40">
          &copy; {new Date().getFullYear()} {LEGAL_ENTITY_NAME}
        </p>
      </div>
    </footer>
  );
}
