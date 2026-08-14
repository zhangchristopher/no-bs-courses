import Link from "next/link";
import type { Metadata } from "next";
import { ownerAuth } from "@/owner-auth";
import { getOwnerPublicName } from "@/lib/ownerAccount";
import { updateOwnerPublicNameAction } from "./actions";

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
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Sign in required
        </h1>
        <Link href="/owner/signin" className="mt-4 inline-block underline">
          Sign in
        </Link>
      </main>
    );
  }

  const name = await getOwnerPublicName(session.user.id);

  return (
    <main className="mx-auto max-w-xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Profile</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Your display name is only ever seen by the No BS Courses team — for example when we
        review a business or affiliate-link submission. It&apos;s never shown to the public, so
        feel free to use an alias or online handle instead of your real name if you&apos;d
        rather keep that private. Change it anytime.
      </p>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        This is separate from your legal business name, which you provide (and which stays
        private, used only to verify your paperwork) on the{" "}
        <Link href="/owner/business" className="underline">
          Registered Business
        </Link>{" "}
        page.
      </p>

      {updated && (
        <p className="mt-4 rounded-md bg-emerald-50 px-4 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          Display name updated.
        </p>
      )}

      <form
        action={updateOwnerPublicNameAction}
        className="mt-6 flex flex-col gap-4 rounded-md border border-zinc-200 p-4 dark:border-zinc-800"
      >
        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Display name
          <input
            name="name"
            type="text"
            placeholder="An alias or online handle works fine"
            defaultValue={name ?? ""}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>
        <button
          type="submit"
          className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Save
        </button>
      </form>
    </main>
  );
}
