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
      className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 border border-ink bg-ink px-5 py-3 text-xs font-bold uppercase tracking-eyebrow text-cream transition-colors hover:bg-ink/80 dark:border-ink-dark dark:bg-ink-dark dark:text-cream-dark dark:hover:bg-ink-dark/80"
    >
      <PlusIcon className="h-4 w-4" />
      Add a course
    </Link>
  );
}
