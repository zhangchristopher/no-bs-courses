// Pairs with lib/botCheck.ts's isLikelyBot(). Hidden via CSS positioning
// (not `type="hidden"` or `display:none`, which some scrapers skip) so it
// stays reachable to bots filling every field but invisible to a sighted
// user and skipped by screen readers and tab order.
export default function Honeypot() {
  return (
    <>
      <input
        type="text"
        name="company_website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden"
      />
      {/* eslint-disable-next-line react-hooks/purity -- this is a Server
          Component rendered fresh per request (no client-side re-render to
          be inconsistent across); the timestamp is the whole point. */}
      <input type="hidden" name="form_rendered_at" value={Date.now()} />
    </>
  );
}
