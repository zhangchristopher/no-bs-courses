// 0-100 prospect score. It ranks how worth pursuing a creator is, from sourced
// evidence only. Affiliate participation is deliberately not an input: it must
// never influence ratings, verification, ranking or legitimacy, so it cannot
// influence this score either. Pure module, testable.

export type MatchLevel = "high" | "medium" | "low" | "none";
export type ContactSource = "own_site" | "own_social_bio" | "podcast_or_newsletter_site" | "press_feature" | "directory_listing" | "other" | "none";
export type Activity = "active" | "unclear" | "inactive";
export type BusinessEvidence = "registered_entity" | "operating_business_site" | "personal_brand_only" | "none";
export type Commercial = "strong" | "some" | "none";
export type Fit = "strong" | "some" | "poor";

// A named person or business role beats a generic support desk as a first
// contact. Defaults to business_role when not given.
export type AddressKind = "named_person" | "business_role" | "generic_support";

export type ScoreInput = {
  match: MatchLevel; // exact course-to-owner match evidence
  contactSource: ContactSource; // quality of the public source for the contact
  activity: Activity; // does the course/community appear active
  business: BusinessEvidence; // legitimate business evidence
  commercial: Commercial; // likely commercial activity (public pricing, offers, audience)
  fit: Fit; // fit with No BS Courses
  addressKind?: AddressKind;
};

export type ScoreResult = { score: number; breakdown: Record<Exclude<keyof ScoreInput, "addressKind">, number>; cap: string | null };

// Weights sum to 100. Owner/course match dominates because everything else is
// wasted if we are writing to the wrong person.
const MATCH = { high: 35, medium: 22, low: 8, none: 0 } satisfies Record<string, number>;
const SOURCE = { own_site: 15, own_social_bio: 12, podcast_or_newsletter_site: 12, press_feature: 7, directory_listing: 4, other: 3, none: 0 } satisfies Record<string, number>;
const ACTIVITY = { active: 20, unclear: 9, inactive: 0 } satisfies Record<string, number>;
const BUSINESS = { registered_entity: 15, operating_business_site: 11, personal_brand_only: 5, none: 0 } satisfies Record<string, number>;
const COMMERCIAL = { strong: 10, some: 6, none: 0 } satisfies Record<string, number>;
const FIT = { strong: 5, some: 3, poor: 0 } satisfies Record<string, number>;

export function scoreProspect(i: ScoreInput): ScoreResult {
  const breakdown: ScoreResult["breakdown"] = {
    match: MATCH[i.match],
    // A generic support inbox loses 5 of the source points: it is a weaker way
    // to reach the owner than a named person or a business role.
    contactSource: Math.max(0, SOURCE[i.contactSource] - (i.addressKind === "generic_support" ? 5 : 0)),
    activity: ACTIVITY[i.activity],
    business: BUSINESS[i.business],
    commercial: COMMERCIAL[i.commercial],
    fit: FIT[i.fit],
  };
  let score: number = Object.values(breakdown).reduce((a: number, b: number) => a + b, 0);
  // A weak owner match caps the score no matter how good the rest looks: a
  // prospect we can't tie to the course is never a top prospect.
  let cap: string | null = null;
  if (i.match === "low" && score > 45) { score = 45; cap = "owner match is low; capped at 45"; }
  if (i.match === "none" && score > 25) { score = 25; cap = "no owner match; capped at 25"; }
  return { score, breakdown, cap };
}
