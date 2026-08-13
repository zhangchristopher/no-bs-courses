// First-party anonymous visitor correlation, used only to link an
// unauthenticated visitor's own section clicks to their own later "Go to
// course" click on the same site — not for cross-site tracking.
export const VISITOR_ID_COOKIE = "visitor_id";

export function readVisitorId(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)visitor_id=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function visitorIdCookie(visitorId: string): string {
  const maxAge = 60 * 60 * 24 * 365; // 1 year
  return `${VISITOR_ID_COOKIE}=${encodeURIComponent(visitorId)}; Path=/; Max-Age=${maxAge}; SameSite=Lax; HttpOnly`;
}
