import type { ReactNode } from "react";
import { AlertIcon, CheckMarkIcon } from "@/components/icons";

type Tone = "success" | "error" | "warning" | "info";

// Fill = success (the strongest, most-final state a screen shows). Outline
// = error (cautionary, not final — matches the site's outline/secondary
// button treatment). Dashed, lighter outline = warning/pending, so it sits
// visibly between success and error instead of collapsing into either.
// Plain hairline = info. Valence comes from the icon shape, not a color.
const TONE_CLASSES: Record<Tone, string> = {
  success: "border border-cream bg-cream text-black",
  error: "border border-cream bg-transparent text-cream",
  warning: "border border-dashed border-cream/40 bg-transparent text-cream",
  info: "border border-cream/20 bg-transparent text-cream/70",
};

function ToneIcon({ tone }: { tone: Tone }) {
  if (tone === "success") return <CheckMarkIcon className="h-4 w-4 shrink-0" />;
  if (tone === "error" || tone === "warning") return <AlertIcon className="h-4 w-4 shrink-0" />;
  return null;
}

export function StatusBanner({ tone = "info", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <div className={`mt-4 flex items-start gap-2.5 px-4 py-3 text-sm ${TONE_CLASSES[tone]}`}>
      <ToneIcon tone={tone} />
      <span>{children}</span>
    </div>
  );
}
