import Image from "next/image";

type BadgeSize = "sm" | "md";

const textSizeClasses: Record<BadgeSize, string> = {
  sm: "gap-1 text-xs",
  md: "gap-1.5 text-sm",
};

const iconSizeClasses: Record<BadgeSize, string> = {
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
};

// Just an icon + label — no pill/background container. The green shield /
// red check are full-color brand marks (not monochrome-recolored to match
// theme) — they're status indicators, not decorative icons, so they keep
// their own color in both light and dark mode.
export function RegisteredBusinessBadge({ size = "md" }: { size?: BadgeSize }) {
  return (
    <span
      className={`inline-flex items-center font-medium uppercase tracking-eyebrow text-ink/55 dark:text-ink-dark/55 ${textSizeClasses[size]}`}
    >
      <Image
        src="/brand/badge-registered.png"
        alt=""
        width={20}
        height={20}
        className={`${iconSizeClasses[size]} shrink-0 object-contain`}
      />
      Registered Business
    </span>
  );
}

export function VerifiedCourseBadge({ size = "md" }: { size?: BadgeSize }) {
  return (
    <span
      className={`inline-flex items-center font-medium uppercase tracking-eyebrow text-ink dark:text-ink-dark ${textSizeClasses[size]}`}
    >
      <Image
        src="/brand/badge-verified.png"
        alt=""
        width={20}
        height={20}
        className={`${iconSizeClasses[size]} shrink-0 object-contain`}
      />
      Verified Course
    </span>
  );
}
