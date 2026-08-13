"use client";

import { useEffect } from "react";

// Next.js App Router doesn't reliably scroll to a URL hash on initial page
// load — the browser's native anchor-jump fires before the target element
// exists in the (streamed/hydrated) DOM. This retries once the page has
// actually mounted. scroll-mt-* on the target elements still applies to
// scrollIntoView, so headings still clear the sticky header correctly.
export default function ScrollToHash() {
  useEffect(() => {
    if (!window.location.hash) return;
    const id = decodeURIComponent(window.location.hash.slice(1));
    const section = document.getElementById(id);
    // The id lives on the <section>, but scroll-mt-24 (for the sticky
    // header offset) lives on the <h2> inside it — scroll to that instead.
    const target = section?.querySelector("h2") ?? section;
    // Instant, not smooth — smooth scrolling is driven by rAF and can stall
    // indefinitely on a backgrounded/non-composited tab; instant is
    // deterministic regardless of tab visibility.
    if (target) target.scrollIntoView({ behavior: "instant", block: "start" });
  }, []);

  return null;
}
