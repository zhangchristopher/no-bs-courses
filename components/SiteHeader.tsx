import Link from "next/link";
import { headers } from "next/headers";
import { auth, signOut } from "@/auth";
import { SearchIcon } from "@/components/icons";
import Logo from "@/components/Logo";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";
import { resendLearnerVerificationAction } from "@/app/verify-email/actions";

export default async function SiteHeader() {
  // Style-preview routes render their own nav — the real one would fight it.
  const pathname = (await headers()).get("x-pathname") ?? "";
  if (pathname.startsWith("/style-preview")) return null;

  const session = await auth();

  return (
    <>
    <header className="sticky top-0 z-30 border-b-2 border-zinc-900 bg-white/90 backdrop-blur dark:border-zinc-50 dark:bg-black/80">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0 text-lg">
          <Logo />
        </Link>

        <form action="/courses" method="get" className="relative hidden flex-1 max-w-xs sm:block">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
          <input
            type="search"
            name="q"
            placeholder="Search courses..."
            className="w-full rounded-md border border-zinc-200 bg-zinc-100 py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-zinc-400 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:bg-zinc-900"
          />
          <button type="submit" className="sr-only">
            Search
          </button>
        </form>

        <nav className="ml-auto flex items-center gap-5 text-sm">
          <Link
            href="/courses"
            className="hidden text-zinc-600 hover:text-zinc-900 sm:inline dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Courses
          </Link>
          {session?.user ? (
            <>
              <Link
                href="/account"
                className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
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
                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-zinc-900 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-white hover:bg-red-600 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-red-500 dark:hover:text-white"
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
