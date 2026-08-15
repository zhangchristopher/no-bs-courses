import Link from "next/link";

export default function AccountTypeToggle({
  active,
  callbackUrl,
}: {
  active: "personal" | "business";
  callbackUrl?: string;
}) {
  const suffix = callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : "";
  const tabs = [
    { key: "personal" as const, label: "Personal", href: `/signup${suffix}` },
    { key: "business" as const, label: "Business", href: `/owner/signup${suffix}` },
  ];

  return (
    <div className="mt-6 inline-flex border border-hairline p-1 dark:border-hairline-dark">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={
            tab.key === active
              ? "bg-ink px-4 py-1.5 text-xs font-bold uppercase tracking-eyebrow text-cream dark:bg-ink-dark dark:text-cream-dark"
              : "px-4 py-1.5 text-xs font-bold uppercase tracking-eyebrow text-ink/60 hover:text-ink dark:text-ink-dark/60 dark:hover:text-ink-dark"
          }
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
