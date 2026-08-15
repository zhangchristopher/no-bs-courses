import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger";
type Size = "sm" | "md";

// Approve = primary (solid fill), Reject = secondary/danger (outline) — the
// same visual-weight hierarchy the site already used with emerald/red,
// translated to monochrome: fill is the strongest/most-final state per
// screen, outline is secondary or cautionary.
const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-black text-white hover:bg-black/80 dark:bg-cream dark:text-black dark:hover:bg-cream/80",
  secondary:
    "border border-black bg-transparent text-black hover:bg-black hover:text-white dark:border-cream dark:text-cream dark:hover:bg-cream dark:hover:text-black",
  danger:
    "border border-black bg-transparent text-black hover:bg-black hover:text-white dark:border-cream dark:text-cream dark:hover:bg-cream dark:hover:text-black",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-[11px]",
  md: "px-5 py-2.5 text-xs",
};

const BASE =
  "inline-flex items-center justify-center gap-2 font-semibold uppercase tracking-eyebrow transition-colors disabled:pointer-events-none disabled:opacity-40";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & { href?: undefined };

type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children" | "href"> & { href: string };

// Renders as a real <button> for form-action submit sites, or as a <Link>
// when given an href — the two shapes every primary/secondary/danger call
// site in the app already uses, so this needed no third rendering mode.
export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", size = "md", className = "", children, href, ...rest } = props;
  const classes = [BASE, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className].filter(Boolean).join(" ");

  if (href !== undefined) {
    return (
      <Link href={href} className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
