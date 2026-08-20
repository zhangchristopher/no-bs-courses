// One-time import for the two research workbooks
// (NoBS_Courses_Skool_1500_Paid_First.xlsx, NoBS_Courses_1500_Master_Catalog.xlsx).
//
// Only rows the source workbook itself marks as resolved to a real,
// specific course/community (a real name, a real creator, a URL that
// points somewhere specific — not a search page) get published as courses.
// Everything else — the vast majority of both files — is a templated
// discovery lead (e.g. Creator "Resolve from Skool", or a YouTube
// *search-results* URL, sometimes pairing a topic with a plausible-sounding
// but factually wrong creator) and gets staged in `import_leads` instead of
// published, so the research isn't lost but nothing unverified goes live.
import path from "node:path";
import dotenv from "dotenv";
import XLSX from "xlsx";
import postgres from "postgres";

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });
const sql = postgres(process.env.DATABASE_URL!, { ssl: "require" });

// Inlined rather than imported from lib/ownerCourses.ts — that module also
// pulls in lib/db.ts, which opens its own DB connection at import time
// using process.env.DATABASE_URL. Since imports are evaluated before this
// file's own dotenv.config() call above runs, that second connection would
// throw before .env.local is even loaded.
function courseSlugBase(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}

const SKOOL_FILE = "C:/Users/zhang/Downloads/NoBS_Courses_Skool_1500_Paid_First.xlsx";
const MASTER_FILE = "C:/Users/zhang/Downloads/NoBS_Courses_1500_Master_Catalog.xlsx";

type SkoolRow = {
  "Community / Lead": string;
  Creator: string | null;
  Category: string | null;
  "Pricing Type": string | null;
  Price: string | null;
  Members: string | null;
  "Course / Curriculum": string | null;
  "Skool URL / Discovery Search": string | null;
  Verification: string | null;
  "NoBS Priority": string | null;
};

type MasterRow = {
  "Course / Lead": string;
  "Creator / Channel": string | null;
  Style: string | null;
  Category: string | null;
  Topic: string | null;
  Price: string | null;
  Platform: string | null;
  "URL / Search": string | null;
  Verification: string | null;
  Published: string | number | null;
  Level: string | null;
  Duration: string | null;
  Notes: string | null;
};

function parsePrice(raw: string | null): number | null {
  if (!raw) return null;
  if (/^free$/i.test(raw.trim())) return 0;
  const matches = [...raw.matchAll(/\$([\d,]+(?:\.\d+)?)/g)].map((m) => Number(m[1].replace(/,/g, "")));
  if (matches.length === 0) return null;
  return Math.min(...matches);
}

// Consolidates the workbook's ~12 granular category strings down to a
// handful of buckets with enough courses each to be a real category page,
// instead of importing a dozen one-course "categories" that fragment the
// site's category browse (the exact free-text fragmentation problem flagged
// in the product audit — no reason to reproduce it on day one of an import).
const SKOOL_CATEGORY_MAP: Record<string, string> = {
  "AI Automation": "AI Automation",
  "AI Automation / Skool Growth": "AI Automation",
  "AI Automation Agency": "AI Automation",
  "AI Automation / Online Business": "AI Automation",
  "AI Business / Client Acquisition": "AI Business",
  "AI Business": "AI Business",
  "Creator Economy / AI": "AI Business",
  "AI Video / Creator Economy": "AI Business",
  "AI Writing / Publishing": "AI Business",
  Ecommerce: "Ecommerce",
  "Ecommerce / Dropshipping": "Ecommerce",
  "Amazon / Ecommerce": "Ecommerce",
  "Business / Coaching": "Business Coaching",
  "Creator Economy": "Business Coaching",
  "Niche Business": "Business Coaching",
};

async function insertCourse(params: {
  title: string;
  providerName: string;
  platformUrl: string;
  platform: string;
  category: string;
  description: string;
  price: number | null;
  importSource: string;
}) {
  const base = courseSlugBase(params.title) || "course";
  let slug = base;
  let suffix = 2;
  for (;;) {
    const [existing] = await sql`SELECT 1 FROM courses WHERE slug = ${slug} LIMIT 1`;
    if (!existing) break;
    slug = `${base}-${suffix}`;
    suffix++;
  }

  const [course] = await sql<{ id: string; slug: string }[]>`
    INSERT INTO courses (
      slug, title, provider_name, platform_url, platform, category,
      listing_status, import_source, imported_at
    )
    VALUES (
      ${slug}, ${params.title}, ${params.providerName}, ${params.platformUrl}, ${params.platform},
      ${params.category}, 'published', ${params.importSource}, now()
    )
    RETURNING id, slug
  `;

  await sql`
    INSERT INTO course_owner_fields (course_id, description, price)
    VALUES (${course.id}, ${params.description}, ${params.price})
  `;

  return course;
}

// A row's own "Verified" label isn't enough on its own — six rows labeled
// "Verified in Skool discovery" all shared the exact same generic
// discovery-search URL (skool.com/discovery?q=AI), not a specific
// community page, and got published as real courses before this check
// existed. Require the URL to actually point at a specific community, the
// same bar applied to exclude the 2,979 unlabeled leads.
function isSpecificSkoolUrl(url: string | null): boolean {
  if (!url) return false;
  return !url.includes("/discovery");
}

async function importSkool() {
  const wb = XLSX.readFile(SKOOL_FILE);
  const rows = XLSX.utils.sheet_to_json<SkoolRow>(wb.Sheets["Skool 1500 Master"], { defval: null });

  const verified = rows.filter(
    (r) =>
      String(r.Verification ?? "").startsWith("Verified") &&
      isSpecificSkoolUrl(r["Skool URL / Discovery Search"])
  );
  const leads = rows.filter(
    (r) =>
      !String(r.Verification ?? "").startsWith("Verified") ||
      !isSpecificSkoolUrl(r["Skool URL / Discovery Search"])
  );

  console.log(`Skool workbook: ${verified.length} verified, ${leads.length} leads`);

  let published = 0;
  for (const r of verified) {
    const price = parsePrice(r.Price);
    const category = SKOOL_CATEGORY_MAP[r.Category ?? ""] ?? "AI Business";
    const memberNote =
      r.Members && !/unknown|verify/i.test(r.Members) ? ` ~${r.Members} members.` : "";
    const description = `${r["Course / Curriculum"] ?? ""} Pricing: ${r.Price ?? "unknown"} (Skool subscription — billed monthly, not a one-time purchase).${memberNote}`.trim();

    await insertCourse({
      title: r["Community / Lead"],
      providerName: r.Creator && r.Creator.trim() ? r.Creator.trim() : "Unknown",
      platformUrl: r["Skool URL / Discovery Search"] ?? "",
      platform: "Skool",
      category,
      description,
      price,
      importSource: "excel_import:skool_1500",
    });
    published++;
  }

  if (leads.length > 0) {
    const leadRows = leads.map((r) => ({
      source_workbook: "NoBS_Courses_Skool_1500_Paid_First.xlsx",
      source_sheet: "Skool 1500 Master",
      name: r["Community / Lead"],
      category: r.Category,
      raw_data: sql.json(JSON.parse(JSON.stringify(r))),
      status: "unresolved",
    }));
    for (let i = 0; i < leadRows.length; i += 500) {
      const batch = leadRows.slice(i, i + 500);
      await sql`
        INSERT INTO import_leads ${sql(batch, "source_workbook", "source_sheet", "name", "category", "raw_data", "status")}
      `;
    }
  }

  console.log(`Skool: published ${published}, staged ${leads.length} leads`);
}

async function importMaster() {
  const wb = XLSX.readFile(MASTER_FILE);
  const rows = XLSX.utils.sheet_to_json<MasterRow>(wb.Sheets["Master 1500"], { defval: null });

  const verified = rows.filter((r) => String(r.Verification ?? "") === "Verified source");
  const catalogRefs = rows.filter((r) => String(r.Verification ?? "") === "Platform catalog");
  const leads = rows.filter(
    (r) => !["Verified source", "Platform catalog"].includes(String(r.Verification ?? ""))
  );

  console.log(
    `Master workbook: ${verified.length} verified courses, ${catalogRefs.length} catalog refs (staged, not courses), ${leads.length} leads`
  );

  let published = 0;
  for (const r of verified) {
    const durationNote = r.Duration ? ` Duration: ${r.Duration}.` : "";
    const levelNote = r.Level ? ` Level: ${r.Level}.` : "";
    const description = `${r.Notes ?? ""}${durationNote}${levelNote}`.trim();

    await insertCourse({
      title: r["Course / Lead"],
      providerName: r["Creator / Channel"] && r["Creator / Channel"].trim() ? r["Creator / Channel"].trim() : "Unknown",
      platformUrl: r["URL / Search"] ?? "",
      platform: r.Platform ?? "Other",
      category: r.Category ?? "Vibe Coding",
      description,
      price: parsePrice(r.Price),
      importSource: "excel_import:master_catalog_1500",
    });
    published++;
  }

  // Catalog references (MIT OCW, Khan Academy, OpenLearn) point at an entire
  // platform's course library, not one course — staged as leads with their
  // own reason so a future pass knows to go pick specific courses off them,
  // not to publish the catalog homepage itself as if it were a course.
  const toStage = [...catalogRefs, ...leads];
  if (toStage.length > 0) {
    const leadRows = toStage.map((r) => ({
      source_workbook: "NoBS_Courses_1500_Master_Catalog.xlsx",
      source_sheet: "Master 1500",
      name: r["Course / Lead"],
      category: r.Category,
      raw_data: sql.json(JSON.parse(JSON.stringify(r))),
      status: "unresolved",
    }));
    for (let i = 0; i < leadRows.length; i += 500) {
      const batch = leadRows.slice(i, i + 500);
      await sql`
        INSERT INTO import_leads ${sql(batch, "source_workbook", "source_sheet", "name", "category", "raw_data", "status")}
      `;
    }
  }

  console.log(`Master: published ${published}, staged ${toStage.length} (${catalogRefs.length} catalog refs + ${leads.length} leads)`);
}

async function main() {
  await importSkool();
  await importMaster();
}

main()
  .catch((err) => {
    console.error("Import failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sql.end();
  });
