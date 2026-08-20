import Link from "next/link";
import { getAdminSession } from "@/lib/admin";

const ADMIN_NAV = [
  { href: "/admin/verifications", label: "Listings" },
  { href: "/admin/businesses", label: "Businesses" },
  { href: "/admin/claims", label: "Claims" },
  { href: "/admin/flags", label: "Flags" },
  { href: "/admin/purchase-verifications", label: "Purchases" },
  { href: "/admin/affiliate-links", label: "Affiliate Links" },
  { href: "/admin/featured", label: "Featured" },
];

// Owns the persistent nav/chrome only — not the authorization decision.
// Each page still calls getAdminSession() itself for content gating, since
// a signed-out or non-admin visitor gets an in-page "Not authorized"
// message rather than a redirect, and a layout can't branch on that per page.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-hairline bg-cream dark:border-hairline-dark dark:bg-cream-dark">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/admin/verifications" className="text-xs font-bold uppercase tracking-eyebrow text-ink dark:text-ink-dark">
            Admin
          </Link>
          {session.authorized && (
            <>
              <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] uppercase tracking-eyebrow">
                {ADMIN_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-ink/60 hover:text-ink dark:text-ink-dark/60 dark:hover:text-ink-dark"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <span className="text-[11px] uppercase tracking-eyebrow text-ink/40 dark:text-ink-dark/40">
                {session.email}
              </span>
            </>
          )}
        </div>
      </header>
      {children}
    </div>
  );
}
