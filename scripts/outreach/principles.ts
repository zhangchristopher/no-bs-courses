// Independence principles, hard-coded. They constrain every piece of generated
// outreach copy (first emails, follow-ups, reply templates) and are enforced by
// copyViolations(), which the draft validator and the reply rules both call.
// Pure module: no imports, safe to load in tests.

export const PRINCIPLES = [
  "An affiliate relationship is not an endorsement.",
  "An affiliate relationship is not proof of profitability.",
  "A registered business is not a high-quality course.",
  "A paying subscriber does not get a better rating.",
  "A paying subscriber does not get stronger factual verification.",
  "An advertiser is not a recommended course.",
  "Revenue evidence is not profit unless profit is actually verified.",
] as const;

type Rule = { pattern: RegExp; why: string };

// Text matching any rule is rejected. Patterns are deliberately broad: a false
// alarm costs a rewrite, a miss costs trust.
const RULES: Rule[] = [
  { pattern: /affiliat\w*[^.]{0,80}\b(prove|proves|proof|trust|trusted|legit|legitim\w*|quality|endorse\w*|recommend\w*|credib\w*)\b/i, why: "implies affiliate participation shows quality, trust or legitimacy" },
  { pattern: /\b(prove|proves|proof|trust|trusted|credib\w*|legitim\w*)\b[^.]{0,80}affiliat\w*/i, why: "implies affiliate participation shows quality, trust or legitimacy" },
  { pattern: /affiliat\w*[^.]{0,80}\b(profit\w*|earn\w*|income|money|revenue|commission)\b/i, why: "ties affiliate participation to earnings or profit" },
  { pattern: /\b(profitab\w*|profit)\b/i, why: "profit claims need verified profit; do not mention profit" },
  { pattern: /\b(we|no bs courses)\s+(endorse|recommend|vouch|guarantee)\w*/i, why: "implies we endorse or recommend the course" },
  { pattern: /\b(endorse\w*|vouch\w*|guarantee\w*)\b/i, why: "endorsement or guarantee language" },
  { pattern: /(registered|verified)\s+business[^.]{0,60}\b(good|great|best|quality|proves?|trusted|reputable|top)\b/i, why: "implies a verified business means a good course" },
  { pattern: /\b(paying|paid|subscri\w+|founding owner|owner plan|upgrad\w*)\b[^.]{0,80}\b(better|higher|improved?|boost\w*|stronger|more)\s+(rating|score|ranking|rank|verification|credib\w*|trust\w*|visib\w*)/i, why: "implies paying improves ratings, ranking, verification or trust" },
  { pattern: /\b(more|extra|added)\s+(credible|trusted|legitimate|verified)\b/i, why: "implies paying makes a business more credible or verified" },
  { pattern: /\b(advertis\w*|sponsor\w*)\b[^.]{0,80}\b(recommend\w*|featured|top|best)\b/i, why: "implies advertising makes a course recommended" },
  { pattern: /\brevenue\b[^.]{0,60}\b(means|shows|proves|so it'?s|therefore)\b/i, why: "treats revenue as proof of quality or profit" },
  { pattern: /\$\s?12\s+(forever|for life|always)|forever|for life|lifetime (price|rate|pricing)/i, why: "'forever' pricing; the $12 is the first annual term only" },
  { pattern: /(limited time|act now|last chance|hurry|only \d+ (spots|left)|expires? (soon|today|tonight)|deadline|ends (soon|today|tonight))/i, why: "fake urgency" },
];

export function copyViolations(text: string): string[] {
  const found: string[] = [];
  for (const { pattern, why } of RULES) {
    if (pattern.test(text) && !found.includes(why)) found.push(why);
  }
  return found;
}
