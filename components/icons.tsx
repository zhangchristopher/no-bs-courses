export function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path
        d="M10 1.5 3 4v5.1c0 4.6 2.9 8 7 9.4 4.1-1.4 7-4.8 7-9.4V4l-7-2.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

// A plain checkmark glyph — matches the mark in the No BS Courses logo, no
// circle or pill behind it.
export function CheckMarkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 10.3 8 14.3 16.5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M18 18 13.7 13.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Shared single-stroke SVG language for the rest of the site — every icon
// below is stroke="currentColor" strokeWidth={1.5}, one consistent weight,
// no fills, no unicode/emoji glyphs standing in for an icon system.

export function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5" y="11" width="14" height="9" rx="1.5" />
      <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
    </svg>
  );
}

export function StarOutlineIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2.5l2.9 6.4 7 .8-5.2 4.8 1.5 6.9L12 17.9l-6.2 3.5 1.5-6.9L2.1 9.7l7-.8L12 2.5z" />
    </svg>
  );
}

export function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2.5l2.9 6.4 7 .8-5.2 4.8 1.5 6.9L12 17.9l-6.2 3.5 1.5-6.9L2.1 9.7l7-.8L12 2.5z" />
    </svg>
  );
}

export function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M10 8.5l6 3.5-6 3.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ArrowIcon({
  direction = "right",
  className,
}: {
  direction?: "left" | "right";
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={direction === "left" ? { transform: "scaleX(-1)" } : undefined}
    >
      <path d="M4 12h16M13 6l7 6-7 6" />
    </svg>
  );
}

export function AlertIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3.5 21.5 20h-19L12 3.5z" />
      <path d="M12 10v4.2" />
      <circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function HeartIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20.3s-7.6-4.6-10-9.2C.5 7.7 2.4 4.4 6 4c2.2-.3 4.3.8 6 3 1.7-2.2 3.8-3.3 6-3 3.6.4 5.5 3.7 4 7.1-2.4 4.6-10 9.2-10 9.2z" />
    </svg>
  );
}

// Category glyphs, keyed by category name — reused three ways across the
// site: category nav, dark tiles, and faint course-thumbnail watermarks.
// Falls back to null for an unrecognized category rather than a generic
// placeholder shape, so a new category is a deliberate addition here, not
// a silent mismatch.
export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const shared = {
    className,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "Computer Science":
      return (
        <svg {...shared}>
          <path d="M8.5 8 4 12l4.5 4M15.5 8l4.5 4-4.5 4M13.5 6l-3 12" />
        </svg>
      );
    case "Business":
      return (
        <svg {...shared}>
          <rect x="3.5" y="7.5" width="17" height="12" rx="1.5" />
          <path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5M3.5 12.5h17" />
        </svg>
      );
    case "Design":
      return (
        <svg {...shared}>
          <path d="M4 20l1-5L16 4l4 4L9 19l-5 1z" />
          <path d="M13 7l4 4" />
        </svg>
      );
    case "Data & AI":
      return (
        <svg {...shared}>
          <path d="M4 20V10M11 20V4M18 20v-7M4 20h16" />
        </svg>
      );
    default:
      return null;
  }
}

// Trust-strip glyphs, keyed by position — verified-purchase / zero
// pay-to-rank / real accounts / admin-reviewed, matched to whichever four
// claims a given section renders in that order.
export function ClaimIcon({ index, className }: { index: number; className?: string }) {
  const shared = {
    className,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (index) {
    case 0: // Verified-purchase reviews only
      return (
        <svg {...shared}>
          <path d="M12 3.5 5.5 6v5.5c0 4.2 2.8 7 6.5 8.5 3.7-1.5 6.5-4.3 6.5-8.5V6L12 3.5z" />
          <path d="M9 12l2 2 4-4.5" />
        </svg>
      );
    case 1: // Zero pay-to-rank listings
      return (
        <svg {...shared}>
          <circle cx="12" cy="12" r="7.5" />
          <path d="M7 7l10 10" />
        </svg>
      );
    case 2: // Real accounts, no drive-by ratings
      return (
        <svg {...shared}>
          <circle cx="12" cy="8.3" r="3.1" />
          <path d="M5.5 20c1-3.9 3.6-5.9 6.5-5.9s5.5 2 6.5 5.9" />
        </svg>
      );
    case 3: // Every listing checked before it's live
      return (
        <svg {...shared}>
          <rect x="6" y="4" width="12" height="16.5" rx="1.5" />
          <path d="M9.5 3.5h5v2h-5z" />
          <path d="M9 12.5l2 2 4-4.5" />
        </svg>
      );
    default:
      return null;
  }
}
