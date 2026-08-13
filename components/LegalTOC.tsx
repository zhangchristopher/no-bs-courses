"use client";

export default function LegalTOC({ items }: { items: { id: string; label: string }[] }) {
  // Handle the click ourselves instead of relying on the browser's native
  // fragment-scroll: that's driven by scroll-behavior: smooth, which is
  // rAF-based and can stall on a backgrounded tab. This is instant and
  // deterministic, and still targets the h2 (not the section) so the
  // scroll-mt-24 sticky-header offset is respected.
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const section = document.getElementById(id);
    const target = section?.querySelector("h2") ?? section;
    if (!target) return;
    e.preventDefault();
    history.pushState(null, "", `#${id}`);
    target.scrollIntoView({ behavior: "instant", block: "start" });
  };

  return (
    <nav className="mt-8 rounded-lg border border-zinc-200 p-5 dark:border-zinc-800" aria-label="Table of contents">
      <p className="text-xs font-bold uppercase tracking-widest text-red-600 dark:text-red-500">
        On this page
      </p>
      <ol className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
        {items.map((item, i) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => handleClick(e, item.id)}
              className="text-sm text-zinc-600 hover:text-red-600 hover:underline dark:text-zinc-400 dark:hover:text-red-500"
            >
              {i + 1}. {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
