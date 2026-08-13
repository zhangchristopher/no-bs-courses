import { ShieldIcon, CheckMarkIcon } from "@/components/icons";

type BadgeSize = "sm" | "md";

const textSizeClasses: Record<BadgeSize, string> = {
  sm: "gap-1 text-xs",
  md: "gap-1.5 text-sm",
};

const iconSizeClasses: Record<BadgeSize, string> = {
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
};

// Just an icon + colored label — no pill/background container.
export function RegisteredBusinessBadge({ size = "md" }: { size?: BadgeSize }) {
  return (
    <span
      className={`inline-flex items-center font-medium text-zinc-500 dark:text-zinc-400 ${textSizeClasses[size]}`}
    >
      <ShieldIcon className={`${iconSizeClasses[size]} shrink-0`} />
      Registered Business
    </span>
  );
}

// Brand green, matching the checkmark in the No BS Courses logo.
export function VerifiedCourseBadge({ size = "md" }: { size?: BadgeSize }) {
  return (
    <span
      className={`inline-flex items-center font-medium text-green-600 dark:text-green-500 ${textSizeClasses[size]}`}
    >
      <CheckMarkIcon className={`${iconSizeClasses[size]} shrink-0`} />
      Verified Course
    </span>
  );
}
