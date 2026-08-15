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

// Just an icon + label — no pill/background container.
export function RegisteredBusinessBadge({ size = "md" }: { size?: BadgeSize }) {
  return (
    <span
      className={`inline-flex items-center font-medium uppercase tracking-eyebrow text-ink/55 dark:text-ink-dark/55 ${textSizeClasses[size]}`}
    >
      <ShieldIcon className={`${iconSizeClasses[size]} shrink-0`} />
      Registered Business
    </span>
  );
}

// Monochrome, matching the site's blunt-badge language established on the
// editorial-minimal design — status is shown by weight/opacity, not a
// reserved accent color. Verified reads darker/heavier than Registered
// Business since it's the stronger claim.
export function VerifiedCourseBadge({ size = "md" }: { size?: BadgeSize }) {
  return (
    <span
      className={`inline-flex items-center font-medium uppercase tracking-eyebrow text-ink dark:text-ink-dark ${textSizeClasses[size]}`}
    >
      <CheckMarkIcon className={`${iconSizeClasses[size]} shrink-0`} />
      Verified Course
    </span>
  );
}
