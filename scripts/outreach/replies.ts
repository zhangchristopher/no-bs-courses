// Reply classification and deterministic response rules for inbound creator
// emails. Rule-based on purpose: the AI does not improvise responses. Each
// category maps to a fixed policy and, at most, a fixed template built from
// lib/pricing.ts. Anything uncertain, sensitive or commercial goes to a human.
//
// "Auto response permitted" is a policy flag only. No automatic reply sender is
// enabled; a person (or a future, separately approved worker) sends. Pure
// module: no database, safe to load in tests.
import { OWNER_PRICING, planSummary, formatUsd } from "../../lib/pricing";
import { copyViolations } from "./principles";

export const CATEGORIES = [
  "OWNER_CONFIRMED", "CLAIM_LINK_REQUEST", "INTERESTED", "HOW_DO_I_CLAIM", "PRICE_QUESTION",
  "HOW_VERIFICATION_WORKS", "REVIEW_QUESTION", "FOUNDING_PLAN_QUESTION", "AFFILIATE_QUESTION",
  "PARTNERSHIP_INTEREST", "WRONG_PERSON", "NOT_OWNER", "COURSE_INACTIVE", "ALREADY_CLAIMED",
  "NOT_INTERESTED", "UNSUBSCRIBE", "ANGRY", "LEGAL_CONCERN", "AMBIGUOUS", "HUMAN_REQUIRED",
] as const;
export type Category = (typeof CATEGORIES)[number];

export type Classification = {
  classification: Category;
  confidence: number; // 0..1
  recommendedAction: string;
  autoResponsePermitted: boolean;
  humanReviewRequired: boolean;
  template: TemplateName | null;
  reasons: string[];
};

export type TemplateName = "CLAIM_EXPLAIN" | "CLAIM_LINK" | "PRICE" | "VERIFICATION" | "REVIEWS" | "FOUNDING" | "WRONG_PERSON";

// One threshold. At or above it, and for a category that isn't always sent to a
// person, no human review is required and a fixed template may be used.
// Below it, a person always decides.
export const HUMAN_BELOW = 0.8;
export const AUTO_MIN = 0.8;

type Policy = { action: string; template: TemplateName | null; auto: boolean; humanAlways: boolean; positive: boolean };

// The whole policy table. Changing what may be automated means editing this.
const POLICY: Record<Category, Policy> = {
  OWNER_CONFIRMED: { action: "Explain the free first claim and verification; log owner_confirmed", template: "CLAIM_EXPLAIN", auto: true, humanAlways: false, positive: true },
  CLAIM_LINK_REQUEST: { action: "Resend this recipient's own claim link", template: "CLAIM_LINK", auto: true, humanAlways: false, positive: true },
  INTERESTED: { action: "Explain the free first claim and verification", template: "CLAIM_EXPLAIN", auto: true, humanAlways: false, positive: true },
  HOW_DO_I_CLAIM: { action: "Explain the claim steps", template: "CLAIM_EXPLAIN", auto: true, humanAlways: false, positive: true },
  PRICE_QUESTION: { action: "Answer with the Founding Owner pricing from lib/pricing.ts", template: "PRICE", auto: true, humanAlways: false, positive: true },
  HOW_VERIFICATION_WORKS: { action: "Explain that verification is factual and separate from scores and payment", template: "VERIFICATION", auto: true, humanAlways: false, positive: true },
  REVIEW_QUESTION: { action: "Explain that reviews and scores are independent of payment", template: "REVIEWS", auto: true, humanAlways: false, positive: true },
  FOUNDING_PLAN_QUESTION: { action: "Explain the optional Founding Owner plan", template: "FOUNDING", auto: true, humanAlways: false, positive: true },
  AFFILIATE_QUESTION: { action: "Route to the founder. Do not discuss affiliate terms automatically", template: null, auto: false, humanAlways: true, positive: true },
  PARTNERSHIP_INTEREST: { action: "Route to the founder: possible high-value opportunity", template: null, auto: false, humanAlways: true, positive: true },
  WRONG_PERSON: { action: "Ask once for the right contact, mark wrong_person, no follow-up", template: "WRONG_PERSON", auto: true, humanAlways: false, positive: false },
  NOT_OWNER: { action: "Ask once for the right contact, mark wrong_person, no follow-up", template: "WRONG_PERSON", auto: true, humanAlways: false, positive: false },
  COURSE_INACTIVE: { action: "No reply. Hold the listing for review and stop the sequence", template: null, auto: false, humanAlways: false, positive: false },
  ALREADY_CLAIMED: { action: "No reply. A person confirms the claim in admin, then stop the sequence", template: null, auto: false, humanAlways: true, positive: false },
  NOT_INTERESTED: { action: "No reply. Suppress the address and stop the sequence", template: null, auto: false, humanAlways: false, positive: false },
  UNSUBSCRIBE: { action: "Suppress globally now. No further promotional message. Log it", template: null, auto: false, humanAlways: false, positive: false },
  ANGRY: { action: "Route to the founder. Stop the sequence and do not contact again", template: null, auto: false, humanAlways: true, positive: false },
  LEGAL_CONCERN: { action: "Route to the founder immediately. Stop the sequence and do not contact again", template: null, auto: false, humanAlways: true, positive: false },
  AMBIGUOUS: { action: "A person reads it and decides", template: null, auto: false, humanAlways: true, positive: false },
  HUMAN_REQUIRED: { action: "A person handles this", template: null, auto: false, humanAlways: true, positive: false },
};

type Rule = { category: Category; pattern: RegExp; confidence: number };

// Highest-priority rules first. Safety categories (opt-out, legal, anger) win
// over everything else when they match.
const RULES: Rule[] = [
  { category: "UNSUBSCRIBE", confidence: 0.95, pattern: /\b(unsubscribe|remove me|take me off|stop (emailing|sending|contacting|messaging|writing)|do not (email|contact)|don'?t (email|contact|write)|opt[- ]?out|no more (emails?|messages?)|leave me alone)\b/i },
  { category: "LEGAL_CONCERN", confidence: 0.9, pattern: /\b(lawyer|attorney|legal (action|team|counsel|notice)|cease and desist|sue|suing|lawsuit|defamation|libel|trademark|copyright|dmca|gdpr|can-?spam|ccpa|violat\w+ (the )?(law|my rights))\b/i },
  { category: "ANGRY", confidence: 0.85, pattern: /\b(scam|spam|harass\w*|how dare|furious|outrag\w*|unacceptable|idiot|stupid|fuck\w*|shit\w*|pissed|garbage|fraud\w*|report you)\b/i },
  { category: "WRONG_PERSON", confidence: 0.85, pattern: /\b(wrong (person|email|address|contact)|not the right (person|contact)|you (have|got) the wrong|i (don'?t|do not) (work|handle)|(contact|talk to|reach out to|email|speak (to|with)) (my|our) [a-z ]{0,20}(manager|partner|assistant|team|colleague|co-?founder))\b/i },
  { category: "NOT_OWNER", confidence: 0.85, pattern: /\b(i('?m| am) not the (owner|creator|founder)|i don'?t own|not my (course|community|business)|i('?m| am) just (a|an) (member|student|employee|contractor|assistant)|(sold|handed over) (the|that|this) (course|community|business)|no longer (own|run))\b/i },
  { category: "COURSE_INACTIVE", confidence: 0.85, pattern: /\b(no longer (running|active|offered|available|exists?)|(shut|closed|discontinued|retired|sunset)\w* (down)?|not (running|active|selling) anymore|(course|community) is (dead|closed|gone|over))\b/i },
  { category: "ALREADY_CLAIMED", confidence: 0.85, pattern: /\b(already (claimed|verified|signed up|registered|have an account)|i('?ve| have) (already )?(claimed|signed up|registered|verified))\b/i },
  { category: "NOT_INTERESTED", confidence: 0.85, pattern: /\b(not interested|no thanks|no thank you|not for me|not a fit|don'?t need (it|this|that)|we'?re good|i'?ll pass|decline)\b/i },
  { category: "CLAIM_LINK_REQUEST", confidence: 0.85, pattern: /\b(re-?send|send( me)? (the|a|your)|share (the|a)|can i (get|have)|where'?s|lost|didn'?t (get|see|receive)|new)\b[^.?!]{0,40}\b(claim )?(link|url)\b|\blink (doesn'?t|does not|isn'?t|not) work/i },
  { category: "HOW_DO_I_CLAIM", confidence: 0.8, pattern: /\bhow (do|can|would|should) (i|we) (claim|verify|get started|sign up|join|register)\b|how (does|do) (claiming|the claim|it) work|what (do|would) i (need to )?do\b|next steps?\b|what'?s the process|how to get started/i },
  { category: "FOUNDING_PLAN_QUESTION", confidence: 0.8, pattern: /\b(founding owner|founding plan|founder pricing|optional plan|management (tools|plan)|what (do|does) (i|we|it) get|what'?s included|what is included)\b/i },
  { category: "AFFILIATE_QUESTION", confidence: 0.8, pattern: /\b(affiliate|commission|referral|rev(enue)?[- ]?share|partner program)\b/i },
  { category: "PARTNERSHIP_INTEREST", confidence: 0.75, pattern: /\b(partner(ship)?s?|collaborat\w+|work together|joint venture|feature (me|us|my|our)|cross[- ]?promot\w+|sponsor\w*|advertis\w*)\b/i },
  { category: "PRICE_QUESTION", confidence: 0.8, pattern: /\b(how much|pricing|price|prices|cost|costs|fee|fees|charge|charges|per month|per year|\$\s?\d+|is it free|what does it cost)\b/i },
  { category: "HOW_VERIFICATION_WORKS", confidence: 0.8, pattern: /\b(verif\w+)\b[^.?!]{0,60}\b(work|works|involve|require\w*|need|process|how|what)\b|what (do you|does it) (need|require)|paperwork|documentation|\bllc\b|\bein\b|business registration|registration (number|details)/i },
  { category: "REVIEW_QUESTION", confidence: 0.8, pattern: /\b(reviews?|ratings?|scores?|negative|bad review|remove (a )?review|delete (a )?review|respond to reviews?|reply to reviews?)\b/i },
  { category: "OWNER_CONFIRMED", confidence: 0.85, pattern: /\b(i('?m| am)|we('?re| are)) the (owner|creator|founder)|\bi (own|run|created|built|founded) (it|that|the|this|my)\b|that('?s| is) (my|our) (course|community|business)|it'?s (my|our) (course|community)|this is my (course|community)/i },
  { category: "INTERESTED", confidence: 0.7, pattern: /\b(interested|sounds (good|great)|love (to|this)|tell me more|more info(rmation)?|let'?s (do|talk|chat)|sure\b|yes( please)?\b|i'?m in\b|count me in|happy to)\b/i },
];

const AUTO_OR_BOUNCE = /\b(out of (the )?office|auto(matic)?[- ]?reply|undeliverable|delivery (status|failure)|mailer-daemon|address not found|mailbox (is )?(full|unavailable)|vacation (responder|reply))\b/i;
const PRIORITY: Category[] = ["UNSUBSCRIBE", "LEGAL_CONCERN", "ANGRY"];

function build(category: Category, confidence: number, reasons: string[], forceHuman = false): Classification {
  const p = POLICY[category];
  const humanReviewRequired = forceHuman || p.humanAlways || confidence < HUMAN_BELOW;
  const autoResponsePermitted = p.auto && !humanReviewRequired && confidence >= AUTO_MIN && p.template !== null;
  return {
    classification: category,
    confidence: Math.round(confidence * 100) / 100,
    recommendedAction: humanReviewRequired && !p.humanAlways ? `Low confidence: a person decides. (Policy if confirmed: ${p.action})` : p.action,
    autoResponsePermitted,
    humanReviewRequired,
    template: p.template,
    reasons,
  };
}

// Strips quoted history so our own earlier email (which says "free", "claim",
// "reviews", "$1") can't be mistaken for the recipient's words.
export function replyOwnText(raw: string): string {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  for (const line of lines) {
    if (/^\s*>/.test(line)) continue;
    if (/^\s*(on .{5,80} wrote:|from:\s|-{2,}\s*original message|sent from my)/i.test(line)) break;
    out.push(line);
  }
  return out.join("\n").trim();
}

export function classifyReply(raw: string): Classification {
  const text = replyOwnText(raw);
  const words = text.split(/\s+/).filter(Boolean).length;
  if (words === 0) return build("AMBIGUOUS", 0.2, ["empty reply"], true);
  if (AUTO_OR_BOUNCE.test(text)) return build("AMBIGUOUS", 0.9, ["looks like an auto-reply or bounce, not a person; check it"], true);

  const hits = RULES.filter((r) => r.pattern.test(text));
  if (hits.length === 0) {
    return words < 4 ? build("AMBIGUOUS", 0.3, ["too short to classify"], true) : build("HUMAN_REQUIRED", 0.4, ["no rule matched"], true);
  }

  // Safety categories always win, in priority order.
  for (const cat of PRIORITY) {
    const hit = hits.find((h) => h.category === cat);
    if (hit) {
      const alsoAngry = cat === "UNSUBSCRIBE" && hits.some((h) => h.category === "ANGRY" || h.category === "LEGAL_CONCERN");
      // An opt-out is always honored. If it came with anger or a legal threat, a person also reads it.
      return build(cat, hit.confidence, [`matched ${cat}`, ...(alsoAngry ? ["opt-out came with anger or a legal concern"] : [])], alsoAngry);
    }
  }

  // Otherwise the strongest rule wins; several distinct strong matches means mixed signals.
  const sorted = [...hits].sort((a, b) => b.confidence - a.confidence);
  const top = sorted[0];
  // Mixed signals only matter when the answers would differ: two categories that
  // share a template (e.g. "that's mine, how do I claim?") get the same reply.
  const rivals = sorted.slice(1).filter(
    (h) =>
      h.category !== top.category &&
      top.confidence - h.confidence <= 0.1 &&
      (POLICY[h.category].template === null || POLICY[h.category].template !== POLICY[top.category].template)
  );
  if (rivals.length > 0) {
    return build(top.category, top.confidence - 0.2, [`matched ${top.category}`, `also matched ${rivals.map((r) => r.category).join(", ")}: mixed signals`]);
  }
  return build(top.category, top.confidence, [`matched ${top.category}`]);
}

// ---- What the system does to the pipeline for each category (deterministic) ----

export type PipelineEffect = {
  status: string | null; // creator_outreach.status to move to
  suppress: string | null; // reason, if the address must be suppressed now
  events: ("reply" | "positive_reply" | "wrong_person" | "not_interested" | "unsubscribed" | "complaint")[];
  stopSequence: string | null; // reason, if follow-ups must stop
};

export function pipelineEffect(c: Category): PipelineEffect {
  const positive = POLICY[c].positive;
  const base: PipelineEffect = { status: "replied", suppress: null, events: positive ? ["reply", "positive_reply"] : ["reply"], stopSequence: "recipient replied" };
  switch (c) {
    case "OWNER_CONFIRMED": return { ...base, status: "owner_confirmed" };
    case "UNSUBSCRIBE": return { status: "unsubscribed", suppress: "unsubscribe_reply", events: ["reply", "unsubscribed"], stopSequence: "unsubscribed" };
    case "NOT_INTERESTED": return { status: "not_interested", suppress: "not_interested", events: ["reply", "not_interested"], stopSequence: "not interested" };
    case "WRONG_PERSON":
    case "NOT_OWNER": return { status: "wrong_person", suppress: "wrong_person", events: ["reply", "wrong_person"], stopSequence: "wrong person" };
    case "COURSE_INACTIVE": return { ...base, status: "manual_review", stopSequence: "course inactive" };
    case "ANGRY": return { status: "do_not_contact", suppress: "angry_reply", events: ["reply"], stopSequence: "angry reply" };
    case "LEGAL_CONCERN": return { status: "do_not_contact", suppress: "legal_concern", events: ["reply", "complaint"], stopSequence: "legal concern" };
    case "ALREADY_CLAIMED": return { ...base, stopSequence: "reports already claimed" };
    default: return base;
  }
}

// ---- Fixed response templates ----

export type TemplateContext = { name: string | null; title: string; claimUrl: string };

function pricingLines(): string {
  return [
    `Monthly: ${planSummary("founding", "monthly")}.`,
    `Annual: ${planSummary("founding", "annual")}.`,
    `There is no setup fee (${formatUsd(OWNER_PRICING.standard.setupFeeCents)} for regular pricing after launch), and the founder rate stays while the subscription stays active.`,
  ].join(" ");
}

const NEVER = "Payment never affects reviews, scores, verification, or ranking.";

export const TEMPLATES: Record<TemplateName, (c: TemplateContext) => string> = {
  CLAIM_EXPLAIN: (c) =>
    `Hi ${c.name ?? "there"},\n\nThanks for getting back to me. You can claim your first course listing for free, and business verification is free too. This link identifies ${c.title}; it doesn't skip verification. You still verify your business, and we review the claim before it takes effect: ${c.claimUrl}\n\nThere's also an optional Founding Owner plan with listing-management and customization tools. You don't need it to claim or to be verified. ${NEVER}`,
  CLAIM_LINK: (c) =>
    `Hi ${c.name ?? "there"},\n\nHere's the link again for ${c.title}: ${c.claimUrl}\n\nIt identifies the listing only. You still verify your business (free), and we review the claim before it takes effect. Claiming your first course listing is free.`,
  PRICE: (c) =>
    `Hi ${c.name ?? "there"},\n\nClaiming your first course listing is free, and so is business verification. The only paid option is the optional Founding Owner plan, which unlocks listing-management tools. ${pricingLines()} ${NEVER}\n\nClaim link for ${c.title}: ${c.claimUrl}`,
  VERIFICATION: (c) =>
    `Hi ${c.name ?? "there"},\n\nVerification confirms facts about the business: that it exists and that you're connected to the listing. We review the business registration details you submit. It's free, and it's separate from review scores and from payment. It says nothing about how good a course is. ${NEVER}\n\nClaim link for ${c.title}: ${c.claimUrl}`,
  REVIEWS: (c) =>
    `Hi ${c.name ?? "there"},\n\nReviews and ratings come only from learners, and they stay independent whether an owner pays or not. Payment doesn't improve a score, and a paying owner can't remove a legitimate review because it's negative. ${NEVER}\n\nYou can claim your first course listing for free here: ${c.claimUrl}`,
  FOUNDING: (c) =>
    `Hi ${c.name ?? "there"},\n\nThe Founding Owner plan is optional. It unlocks listing-management and customization tools, such as editing the listing and claiming more courses. You don't need it to claim your first course listing or to be verified, both of which are free. ${pricingLines()} ${NEVER}\n\nClaim link for ${c.title}: ${c.claimUrl}`,
  WRONG_PERSON: (c) =>
    `Hi ${c.name ?? "there"},\n\nThanks for letting me know, and sorry for the mix-up. If you know who looks after ${c.title}, I'd appreciate a pointer to the right person. If not, no problem, and I won't follow up.`,
};

export function renderTemplate(name: TemplateName, ctx: TemplateContext): string {
  const text = TEMPLATES[name](ctx);
  const bad = copyViolations(text);
  if (bad.length > 0) throw new Error(`Template ${name} breaks the independence principles: ${bad.join("; ")}`);
  return text;
}
