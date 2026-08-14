// Shared content for the /style-preview/* comparison routes. Every route
// renders this exact data — only the visual system differs between them,
// so this file is the single source of truth for hero copy, stats,
// categories, and the course list. Never duplicate this data per-route.

export type PreviewCourse = {
  title: string;
  provider: string;
  business: boolean;
  verified: boolean;
  flagged?: boolean;
  rating: number;
  reviewCount: number;
  price: string;
  recurring?: boolean;
  duration: string;
};

export type PreviewCategory = {
  name: string;
  subcats: string[];
  courses: PreviewCourse[];
};

export const SITE_NAME = "No BS Courses";

export const HERO_BADGE = "Finding a black sheep should be easy";
export const HERO_HEADLINE_PRE = "Find the course that's actually";
export const HERO_HEADLINE_ACCENT = "worth";
export const HERO_HEADLINE_POST = "your time.";
export const HERO_SUBHEAD =
  "12,400 reviews here come from people who actually paid — not the crowd repeating marketing copy.";

export const STATS = [
  { value: "12.4K", label: "Verified Reviews" },
  { value: "38K", label: "Active Learners" },
  { value: "2,180", label: "Courses Listed" },
];

export const CATEGORIES: PreviewCategory[] = [
  {
    name: "Computer Science",
    subcats: ["All", "Systems Design", "Web Development", "Cybersecurity", "Cloud & DevOps"],
    courses: [
      { title: "Advanced Systems Design", provider: "Kestrel Academy", business: true, verified: true, rating: 4.9, reviewCount: 312, price: "$129", duration: "8h 30m" },
      { title: "Full-Stack Web Development", provider: "Northfield Institute", business: true, verified: true, rating: 4.3, reviewCount: 441, price: "$49", recurring: true, duration: "22h 10m" },
      { title: "Cybersecurity Fundamentals", provider: "Ironclad Security Labs", business: true, verified: true, rating: 4.9, reviewCount: 267, price: "$59", recurring: true, duration: "6h 45m" },
      { title: "Cloud Infrastructure Essentials", provider: "Northfield Institute", business: true, verified: true, rating: 4.9, reviewCount: 203, price: "Free", duration: "5h 20m" },
      { title: "Database Systems Deep Dive", provider: "Kestrel Academy", business: true, verified: false, rating: 4.3, reviewCount: 38, price: "$99", duration: "4h 15m" },
      { title: "Applied Machine Learning Foundations", provider: "Northfield Institute", business: true, verified: true, rating: 4.3, reviewCount: 890, price: "Free", duration: "9h 40m" },
    ],
  },
  {
    name: "Business",
    subcats: ["All", "Strategy", "Finance", "Entrepreneurship", "Leadership"],
    courses: [
      { title: "Product Strategy for Founders", provider: "Ridgeline Business School", business: false, verified: false, rating: 4.3, reviewCount: 54, price: "$199", duration: "3h 50m" },
      { title: "Financial Modeling Bootcamp", provider: "Ridgeline Business School", business: false, verified: false, rating: 3.5, reviewCount: 41, price: "$249", duration: "7h 05m" },
      { title: "Leadership for New Managers", provider: "Vantage Point Academy", business: true, verified: true, rating: 4.9, reviewCount: 176, price: "$119", duration: "4h 30m" },
      { title: "Startup Fundraising 101", provider: "Vantage Point Academy", business: true, verified: true, rating: 4.3, reviewCount: 92, price: "$149", duration: "2h 45m" },
      { title: "Negotiation Tactics That Work", provider: "Ridgeline Business School", business: true, verified: true, rating: 4.9, reviewCount: 133, price: "$89", duration: "3h 10m" },
      { title: "Growth Hacking Secrets", provider: "ScaleFast Media", business: false, verified: false, flagged: true, rating: 1.2, reviewCount: 2, price: "$499", duration: "1h 20m" },
    ],
  },
  {
    name: "Design",
    subcats: ["All", "UX Research", "Visual Design", "Product Design", "Design Systems"],
    courses: [
      { title: "UX Research Methods", provider: "Harborview Design Co.", business: true, verified: true, rating: 4.9, reviewCount: 128, price: "$89", duration: "5h 15m" },
      { title: "Visual Design Foundations", provider: "Studio Nine Collective", business: true, verified: true, rating: 4.3, reviewCount: 210, price: "$79", duration: "6h 30m" },
      { title: "Building Design Systems", provider: "Harborview Design Co.", business: true, verified: true, rating: 4.9, reviewCount: 96, price: "$45", recurring: true, duration: "8h 00m" },
      { title: "Product Design Sprint", provider: "Studio Nine Collective", business: false, verified: false, rating: 4.3, reviewCount: 29, price: "$119", duration: "2h 30m" },
    ],
  },
  {
    name: "Data & AI",
    subcats: ["All", "Machine Learning", "Data Analysis", "AI Ethics", "MLOps"],
    courses: [
      { title: "Applied ML Foundations", provider: "Northfield Institute", business: true, verified: true, rating: 4.3, reviewCount: 890, price: "Free", duration: "9h 40m" },
      { title: "Data Analysis with Python", provider: "Northfield Institute", business: true, verified: true, rating: 4.9, reviewCount: 354, price: "$39", recurring: true, duration: "10h 20m" },
      { title: "MLOps in Production", provider: "Northfield Institute", business: true, verified: true, rating: 4.3, reviewCount: 87, price: "$179", duration: "6h 50m" },
      { title: "AI Ethics & Governance", provider: "Vantage Point Academy", business: false, verified: false, rating: 4.3, reviewCount: 19, price: "$69", duration: "3h 25m" },
    ],
  },
];

export const ALL_COURSES: PreviewCourse[] = CATEGORIES.flatMap((c) => c.courses);

export const FOOTER_COLUMNS = [
  { head: "Product", links: ["Browse Courses", "Categories", "How Verification Works", "Add a Course"] },
  { head: "For Owners", links: ["Claim a Listing", "Registered Business", "Verified Course"] },
  { head: "Support", links: ["Help Center", "Report a Listing", "Contact"] },
  { head: "Legal", links: ["Privacy Policy", "Terms of Service"] },
];

export const STYLE_PREVIEW_ROUTES = [
  { slug: "8bit", label: "8-bit" },
  { slug: "editorial-minimal", label: "Editorial Minimal" },
  { slug: "bold-portfolio", label: "Bold Portfolio" },
  { slug: "ecommerce-polish", label: "E-commerce Polish" },
  { slug: "brutalist-audit", label: "Brutalist Audit" },
] as const;
