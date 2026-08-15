import Link from "next/link";
import type { Metadata } from "next";
import { ownerAuth } from "@/owner-auth";
import { getOwnerPublicName } from "@/lib/ownerAccount";
import { updateOwnerPublicNameAction } from "./actions";
import { AuthShell } from "@/components/ui/AuthShell";
import { FormField } from "@/components/ui/FormField";
import { StatusBanner } from "@/components/ui/StatusBanner";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Profile" };

export default async function OwnerProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string }>;
}) {
  const { updated } = await searchParams;
  const session = await ownerAuth();

  if (!session?.user?.id) {
    return (
      <AuthShell title="Sign in required" maxWidthClassName="max-w-2xl">
        <Link href="/owner/signin" className="inline-block underline">
          Sign in
        </Link>
      </AuthShell>
    );
  }

  const name = await getOwnerPublicName(session.user.id);

  return (
    <main className="mx-auto max-w-xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-black uppercase tracking-headline text-ink dark:text-ink-dark">Profile</h1>
      <p className="mt-2 text-sm text-ink/60 dark:text-ink-dark/60">
        Your display name is only ever seen by the No BS Courses team — for example when we
        review a business or affiliate-link submission. It&apos;s never shown to the public, so
        feel free to use an alias or online handle instead of your real name if you&apos;d
        rather keep that private. Change it anytime.
      </p>
      <p className="mt-2 text-sm text-ink/60 dark:text-ink-dark/60">
        This is separate from your legal business name, which you provide (and which stays
        private, used only to verify your paperwork) on the{" "}
        <Link href="/owner/business" className="underline">
          Registered Business
        </Link>{" "}
        page.
      </p>

      {updated && <StatusBanner tone="success">Display name updated.</StatusBanner>}

      <form action={updateOwnerPublicNameAction} className="mt-6 flex flex-col gap-4 border border-hairline p-4 dark:border-hairline-dark">
        <FormField
          label="Display name"
          name="name"
          type="text"
          placeholder="An alias or online handle works fine"
          defaultValue={name ?? ""}
        />
        <Button type="submit" className="self-start">
          Save
        </Button>
      </form>
    </main>
  );
}
