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
    <div className="mt-6 inline-flex rounded-md border border-zinc-200 p-1 dark:border-zinc-800">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={
            tab.key === active
              ? "rounded-md bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
              : "rounded-md px-4 py-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          }
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
