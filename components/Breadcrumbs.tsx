import Link from "next/link";

type Crumb = {
  label: string;
  href?: string;
};

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[11px] font-medium uppercase tracking-eyebrow text-ink/45 dark:text-ink-dark/45">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
              <Link href={item.href} className="hover:text-ink dark:hover:text-ink-dark hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className="text-ink/70 dark:text-ink-dark/70" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
