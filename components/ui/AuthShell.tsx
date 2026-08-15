import type { ReactNode } from "react";

// Gives the auth pages a hairline-bordered panel instead of text floating
// directly on the page background — net-new pattern, none of the 8 auth
// pages had any card/panel chrome before this.
export function AuthShell({
  title,
  children,
  maxWidthClassName = "max-w-sm",
  align = "left",
}: {
  title: string;
  children: ReactNode;
  maxWidthClassName?: string;
  align?: "left" | "center";
}) {
  return (
    <main className={`mx-auto ${maxWidthClassName} px-4 py-16 sm:px-6`}>
      <div className={`border border-black/10 p-8 dark:border-cream/15 ${align === "center" ? "text-center" : ""}`}>
        <h1 className="mb-6 text-2xl font-black uppercase tracking-tight text-black dark:text-cream">{title}</h1>
        {children}
      </div>
    </main>
  );
}
