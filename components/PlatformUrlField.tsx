"use client";

import { useState } from "react";
import { detectPlatformFromUrl, KNOWN_PLATFORMS, OTHER_PLATFORM } from "@/lib/platform";

const FIELD_CLASSES =
  "mt-1 w-full border border-hairline bg-transparent px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-ink focus:outline-none dark:border-hairline-dark dark:text-ink-dark dark:placeholder:text-ink-dark/40 dark:focus:border-ink-dark";

// Detects the platform from the URL as it's typed, but only until the
// person touches the platform dropdown themselves — a manual override
// should never get silently clobbered by continuing to edit the URL field.
export default function PlatformUrlField() {
  const [platform, setPlatform] = useState("");
  const [overridden, setOverridden] = useState(false);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
      <label className="text-sm font-medium text-ink dark:text-ink-dark">
        Platform URL
        <input
          name="platform_url"
          type="url"
          required
          placeholder="https://..."
          onChange={(e) => {
            if (overridden) return;
            const detected = detectPlatformFromUrl(e.target.value);
            if (detected) setPlatform(detected);
          }}
          className={FIELD_CLASSES}
        />
      </label>
      <label className="text-sm font-medium text-ink dark:text-ink-dark">
        Platform
        <select
          name="platform"
          value={platform}
          onChange={(e) => {
            setPlatform(e.target.value);
            setOverridden(true);
          }}
          className={FIELD_CLASSES}
        >
          <option value="">Auto-detects from URL</option>
          {KNOWN_PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
          <option value={OTHER_PLATFORM}>Other</option>
        </select>
      </label>
    </div>
  );
}
