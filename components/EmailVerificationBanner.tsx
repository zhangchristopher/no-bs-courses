// Soft nudge only — email_verified is not enforced anywhere yet (a product
// decision, not a technical one). This just prompts, never blocks.
export default function EmailVerificationBanner({
  action,
}: {
  action: () => Promise<void>;
}) {
  return (
    <div className="border-b border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm text-amber-800 sm:px-6 lg:px-8 dark:text-amber-300">
        <span>Please verify your email address.</span>
        <form action={action}>
          <button type="submit" className="font-medium underline">
            Resend verification email
          </button>
        </form>
      </div>
    </div>
  );
}
