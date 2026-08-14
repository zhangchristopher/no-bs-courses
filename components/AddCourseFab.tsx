import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { ownerAuth } from "@/owner-auth";
import { PlusIcon } from "@/components/icons";

// Either identity (learner or owner) is enough to submit a course — matches
// submitNewCourseAction's own check in app/courses/new/actions.ts.
export default async function AddCourseFab() {
  const pathname = (await headers()).get("x-pathname") ?? "";
  if (pathname.startsWith("/style-preview")) return null;

  const [userSession, ownerSession] = await Promise.all([auth(), ownerAuth()]);
  const isSignedIn = Boolean(userSession?.user?.id || ownerSession?.user?.id);

  const href = isSignedIn ? "/courses/new" : "/signin?callbackUrl=/courses/new";

  return (
    <Link
      href={href}
      className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-md border-2 border-zinc-900 bg-zinc-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-600 hover:border-red-600 dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:border-red-500 dark:hover:bg-red-500 dark:hover:text-white"
    >
      <PlusIcon className="h-4 w-4" />
      Add a course
    </Link>
  );
}
