import Link from "next/link";

// Switches between the personal (learner) and business (course owner)
// versions of the sign-up or sign-in page — the two are separate account
// systems with separate pages, so this just links across.
export default function AccountTypeToggle({
  active,
  mode = "signup",
  callbackUrl,
}: {
  active: "personal" | "business";
  mode?: "signup" | "signin";
  callbackUrl?: string;
}) {
  const suffix = callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : "";
  const tabs = [
    { key: "personal" as const, label: "Personal", href: `/${mode}${suffix}` },
    { key: "business" as const, label: "Business", href: `/owner/${mode}${suffix}` },
  ];

  return (
    <div className="mt-6 inline-flex border border-hairline-dark p-1">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={
            tab.key === active
              ? "bg-ink-dark px-4 py-1.5 text-xs font-bold uppercase tracking-eyebrow text-cream-dark"
              : "px-4 py-1.5 text-xs font-bold uppercase tracking-eyebrow text-ink-dark/60 hover:text-ink-dark"
          }
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
