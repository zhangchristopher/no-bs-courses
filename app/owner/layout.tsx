import Link from "next/link";
import { ownerAuth, ownerSignOut } from "@/owner-auth";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";
import { resendOwnerVerificationAction } from "@/app/verify-email/actions";

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const session = await ownerAuth();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/owner/dashboard"
            className="text-sm font-semibold text-zinc-900 dark:text-zinc-50"
          >
            Course Owner Portal
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            {session?.user ? (
              <>
                <Link
                  href="/owner/profile"
                  className="text-zinc-500 hover:underline dark:text-zinc-400"
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
                    className="text-zinc-600 hover:underline dark:text-zinc-400"
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/owner/signin"
                  className="text-zinc-600 hover:underline dark:text-zinc-400"
                >
                  Sign in
                </Link>
                <Link
                  href="/owner/signup"
                  className="text-zinc-600 hover:underline dark:text-zinc-400"
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
