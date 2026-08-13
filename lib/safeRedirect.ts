// Only allow same-origin relative paths, so a callbackUrl query/form value
// can never be used to redirect off-site (open redirect).
export function safeRedirectPath(path: string | null | undefined, fallback: string): string {
  if (!path) return fallback;
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  return path;
}
