import Link from "next/link";
import { ownerAuth, ownerSignOut } from "@/owner-auth";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";
import { resendOwnerVerificationAction } from "@/app/verify-email/actions";

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const session = await ownerAuth();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-hairline bg-cream dark:border-hairline-dark dark:bg-cream-dark">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/owner/dashboard"
            className="text-xs font-bold uppercase tracking-eyebrow text-ink dark:text-ink-dark"
          >
            Course Owner Portal
          </Link>
          <nav className="flex items-center gap-4 text-[13px] uppercase tracking-eyebrow">
            {session?.user ? (
              <>
                <Link
                  href="/owner/profile"
                  className="text-ink/60 hover:text-ink dark:text-ink-dark/60 dark:hover:text-ink-dark"
                >
                  {session.user.name || session.user.email}
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await ownerSignOut({ redirectTo: "/" });
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
                  href="/owner/signin"
                  className="text-ink/60 hover:text-ink dark:text-ink-dark/60 dark:hover:text-ink-dark"
                >
                  Sign in
                </Link>
                <Link
                  href="/owner/signup"
                  className="text-ink/60 hover:text-ink dark:text-ink-dark/60 dark:hover:text-ink-dark"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      {session?.user && !session.user.isEmailVerified && (
        <EmailVerificationBanner action={resendOwnerVerificationAction} />
      )}
      {children}
    </div>
  );
}
