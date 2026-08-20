// Pure string logic, no server-only imports — shared by the Add Course
// client form (auto-detect on the URL field) and the server action
// (re-derives the same value so a submission can't smuggle an unlisted
// platform string through by hand-editing the request).

export const KNOWN_PLATFORMS = [
  "Udemy",
  "Coursera",
  "edX",
  "Skillshare",
  "Skool",
  "LinkedIn Learning",
  "Pluralsight",
  "Codecademy",
  "freeCodeCamp",
  "Khan Academy",
  "YouTube",
  "MIT OpenCourseWare",
  "Udacity",
  "DataCamp",
] as const;

export const OTHER_PLATFORM = "Other";

const HOSTNAME_MAP: Record<string, (typeof KNOWN_PLATFORMS)[number]> = {
  "udemy.com": "Udemy",
  "coursera.org": "Coursera",
  "edx.org": "edX",
  "skillshare.com": "Skillshare",
  "skool.com": "Skool",
  "linkedin.com": "LinkedIn Learning",
  "pluralsight.com": "Pluralsight",
  "codecademy.com": "Codecademy",
  "freecodecamp.org": "freeCodeCamp",
  "khanacademy.org": "Khan Academy",
  "youtube.com": "YouTube",
  "youtu.be": "YouTube",
  "ocw.mit.edu": "MIT OpenCourseWare",
  "udacity.com": "Udacity",
  "datacamp.com": "DataCamp",
};

export function detectPlatformFromUrl(url: string): string | null {
  try {
    const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    for (const [domain, platform] of Object.entries(HOSTNAME_MAP)) {
      if (hostname === domain || hostname.endsWith(`.${domain}`)) return platform;
    }
    return null;
  } catch {
    return null;
  }
}
