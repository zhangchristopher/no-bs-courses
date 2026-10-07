// Constants shared by modules that must stay free of database side effects
// (lib.ts opens a connection when imported; this file does not).

// Drafts are written with "{{site}}" in place of the domain and send.ts
// substitutes the public URL, so a draft made while NEXT_PUBLIC_SITE_URL is
// localhost can't go out with localhost links.
export const SITE_TOKEN = "{{site}}";
