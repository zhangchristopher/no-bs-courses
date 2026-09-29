import type { ReactNode } from "react";

type Tone = "default" | "warning" | "danger";

const TONE_CLASSES: Record<Tone, string> = {
  default: "border-cream/15",
  warning: "border-dashed border-cream/30",
  danger: "border-cream",
};

export function Card({
  tone = "default",
  className = "",
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return <div className={`border p-4 ${TONE_CLASSES[tone]} ${className}`}>{children}</div>;
}
