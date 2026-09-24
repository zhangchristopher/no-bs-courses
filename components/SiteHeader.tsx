import Link from "next/link";
import { headers } from "next/headers";
import { auth, signOut } from "@/auth";
import { SearchIcon } from "@/components/icons";
import Logo from "@/components/Logo";
import CategoryMenu from "@/components/CategoryMenu";
import { getCategoryMenuItems } from "@/lib/courses";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";
import { resendLearnerVerificationAction } from "@/app/verify-email/actions";

export default async function SiteHeader() {
  // Style-preview routes render their own nav — the real one would fight it.
  const pathname = (await headers()).get("x-pathname") ?? "";
  if (pathname.startsWith("/style-preview")) return null;

  // The header renders on every page, including ones that otherwise never
  // touch the database — a failed category lookup drops the dropdown
  // rather than taking the whole page down with it.
  const [session, categories] = await Promise.all([
    auth(),
    getCategoryMenuItems().catch(() => []),
  ]);

  return (
    <>
    <header className="sticky top-0 z-30 border-b border-hairline bg-cream/90 backdrop-blur dark:border-hairline-dark dark:bg-cream-dark/85">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0 text-lg">
          <Logo />
        </Link>

        <div className="hidden max-w-md flex-1 sm:flex">
          {categories.length > 0 && <CategoryMenu categories={categories} />}
          <form action="/courses" method="get" role="search" className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40 dark:text-ink-dark/40" />
            <input
              type="search"
              name="q"
              aria-label="Search courses"
              placeholder="Search courses..."
              className="w-full border border-hairline bg-transparent py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink/40 focus:border-ink focus:outline-none dark:border-hairline-dark dark:text-ink-dark dark:placeholder:text-ink-dark/40 dark:focus:border-ink-dark"
            />
            <button type="submit" className="sr-only">
              Search
            </button>
          </form>
        </div>

        <nav className="ml-auto flex items-center gap-5 text-[13px] uppercase tracking-eyebrow">
          <Link
            href="/courses"
            className="hidden text-ink/60 hover:text-ink sm:inline dark:text-ink-dark/60 dark:hover:text-ink-dark"
          >
            Courses
          </Link>
          {session?.user ? (
            <>
              <Link
                href="/account"
                className="text-ink/60 hover:text-ink dark:text-ink-dark/60 dark:hover:text-ink-dark"
              >
                {session.user.name || session.user.email}
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="text-ink/60 hover:text-ink dark:text-ink-dark/60 dark:hover:text-ink-dark"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="text-ink/60 hover:text-ink dark:text-ink-dark/60 dark:hover:text-ink-dark"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="bg-ink px-4 py-1.5 text-xs font-bold text-cream transition-colors hover:bg-ink/80 dark:bg-ink-dark dark:text-cream-dark dark:hover:bg-ink-dark/80"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
    {session?.user && !session.user.isEmailVerified && (
      <EmailVerificationBanner action={resendLearnerVerificationAction} />
    )}
    </>
  );
}
