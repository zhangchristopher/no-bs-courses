// Soft nudge only — email_verified is not enforced anywhere yet (a product
// decision, not a technical one). This just prompts, never blocks.
export default function EmailVerificationBanner({
  action,
}: {
  action: () => Promise<void>;
}) {
  return (
    <div className="border-b border-dashed border-ink/30 dark:border-ink-dark/30">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm text-ink/70 sm:px-6 lg:px-8 dark:text-ink-dark/70">
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
