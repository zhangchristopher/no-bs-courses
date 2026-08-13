import path from "node:path";
import dotenv from "dotenv";
import postgres from "postgres";

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const sql = postgres(process.env.DATABASE_URL!, { ssl: "require" });

type SeedCourse = {
  slug: string;
  title: string;
  provider_name: string;
  platform_url: string;
  category: string;
  description: string;
  syllabus: string;
  price: number;
  duration_hours: number;
  prerequisites: string;
  thumbnail_url: string;
};

const courses: SeedCourse[] = [
  {
    slug: "modern-javascript-from-scratch",
    title: "Modern JavaScript From Scratch",
    provider_name: "CodeForge Academy",
    platform_url: "https://codeforge.example.com/courses/modern-js",
    category: "Web Development",
    description:
      "A ground-up introduction to JavaScript, covering ES2020+ syntax, async programming, and the DOM, for learners with no prior programming experience.",
    syllabus:
      "1. Syntax & variables\n2. Functions & scope\n3. Arrays & objects\n4. Async/await & promises\n5. DOM manipulation\n6. Final project: a to-do app",
    price: 49.99,
    duration_hours: 18,
    prerequisites: "None — beginner friendly.",
    thumbnail_url: "https://picsum.photos/seed/modern-js/480/320",
  },
  {
    slug: "react-and-nextjs-bootcamp",
    title: "React & Next.js Bootcamp",
    provider_name: "CodeForge Academy",
    platform_url: "https://codeforge.example.com/courses/react-nextjs",
    category: "Web Development",
    description:
      "Build production-ready web apps with React and Next.js, including the App Router, server components, and deployment to Vercel.",
    syllabus:
      "1. React fundamentals\n2. Hooks & state\n3. Next.js App Router\n4. Data fetching & server components\n5. Styling with Tailwind\n6. Deploying to production",
    price: 89.0,
    duration_hours: 26,
    prerequisites: "Basic JavaScript knowledge.",
    thumbnail_url: "https://picsum.photos/seed/react-nextjs/480/320",
  },
  {
    slug: "backend-apis-with-nodejs",
    title: "Backend APIs with Node.js",
    provider_name: "ServerSide Institute",
    platform_url: "https://serversideinstitute.example.com/courses/node-apis",
    category: "Web Development",
    description:
      "Design and build RESTful APIs using Node.js, Express, and PostgreSQL, with a focus on authentication, validation, and testing.",
    syllabus:
      "1. HTTP & REST fundamentals\n2. Express routing & middleware\n3. PostgreSQL & migrations\n4. Auth with JWT\n5. Testing with Jest\n6. Deploying an API",
    price: 69.5,
    duration_hours: 22,
    prerequisites: "Comfortable with JavaScript and basic SQL.",
    thumbnail_url: "https://picsum.photos/seed/node-apis/480/320",
  },
  {
    slug: "css-layout-mastery",
    title: "CSS Layout Mastery",
    provider_name: "PixelCraft School",
    platform_url: "https://pixelcraft.example.com/courses/css-layout",
    category: "Web Development",
    description:
      "Deep dive into Flexbox, CSS Grid, and responsive design patterns used in real-world production interfaces.",
    syllabus:
      "1. Box model recap\n2. Flexbox in depth\n3. CSS Grid in depth\n4. Responsive breakpoints\n5. Building a full page layout",
    price: 34.0,
    duration_hours: 10,
    prerequisites: "Basic HTML & CSS.",
    thumbnail_url: "https://picsum.photos/seed/css-layout/480/320",
  },
  {
    slug: "fullstack-typescript",
    title: "Full-Stack TypeScript",
    provider_name: "ServerSide Institute",
    platform_url: "https://serversideinstitute.example.com/courses/fullstack-ts",
    category: "Web Development",
    description:
      "Use TypeScript across the entire stack — frontend, backend, and database layer — to build type-safe applications end to end.",
    syllabus:
      "1. TypeScript fundamentals\n2. Typing React components\n3. Typing Express APIs\n4. Database types & Zod validation\n5. Full-stack capstone project",
    price: 94.0,
    duration_hours: 30,
    prerequisites: "Working knowledge of JavaScript.",
    thumbnail_url: "https://picsum.photos/seed/fullstack-ts/480/320",
  },
  {
    slug: "python-for-data-analysis",
    title: "Python for Data Analysis",
    provider_name: "DataNorth Academy",
    platform_url: "https://datanorth.example.com/courses/python-data-analysis",
    category: "Data Science",
    description:
      "Learn to wrangle, clean, and analyze real-world datasets using Python, pandas, and NumPy.",
    syllabus:
      "1. Python refresher\n2. NumPy arrays\n3. pandas DataFrames\n4. Cleaning messy data\n5. Exploratory data analysis\n6. Case study project",
    price: 59.0,
    duration_hours: 20,
    prerequisites: "Basic Python syntax.",
    thumbnail_url: "https://picsum.photos/seed/python-data/480/320",
  },
  {
    slug: "machine-learning-foundations",
    title: "Machine Learning Foundations",
    provider_name: "DataNorth Academy",
    platform_url: "https://datanorth.example.com/courses/ml-foundations",
    category: "Data Science",
    description:
      "An intuitive, math-light introduction to supervised and unsupervised learning using scikit-learn.",
    syllabus:
      "1. What is machine learning?\n2. Regression models\n3. Classification models\n4. Clustering\n5. Model evaluation\n6. End-to-end mini project",
    price: 99.0,
    duration_hours: 28,
    prerequisites: "Comfortable with Python and basic statistics.",
    thumbnail_url: "https://picsum.photos/seed/ml-foundations/480/320",
  },
  {
    slug: "sql-for-analysts",
    title: "SQL for Analysts",
    provider_name: "QueryWorks",
    platform_url: "https://queryworks.example.com/courses/sql-for-analysts",
    category: "Data Science",
    description:
      "Master SQL querying, joins, window functions, and query optimization for real analytics workflows.",
    syllabus:
      "1. SELECT basics\n2. Joins & subqueries\n3. Aggregations & GROUP BY\n4. Window functions\n5. Query performance & indexing",
    price: 39.99,
    duration_hours: 14,
    prerequisites: "None — beginner friendly.",
    thumbnail_url: "https://picsum.photos/seed/sql-analysts/480/320",
  },
  {
    slug: "data-visualization-with-python",
    title: "Data Visualization with Python",
    provider_name: "DataNorth Academy",
    platform_url: "https://datanorth.example.com/courses/data-viz-python",
    category: "Data Science",
    description:
      "Create clear, compelling charts and dashboards using Matplotlib, Seaborn, and Plotly.",
    syllabus:
      "1. Principles of good visualization\n2. Matplotlib basics\n3. Statistical plots with Seaborn\n4. Interactive charts with Plotly\n5. Building a small dashboard",
    price: 44.0,
    duration_hours: 12,
    prerequisites: "Basic Python and pandas.",
    thumbnail_url: "https://picsum.photos/seed/data-viz/480/320",
  },
  {
    slug: "statistics-for-data-science",
    title: "Statistics for Data Science",
    provider_name: "QueryWorks",
    platform_url: "https://queryworks.example.com/courses/stats-for-ds",
    category: "Data Science",
    description:
      "Build the statistical foundation behind data science: distributions, hypothesis testing, and regression analysis.",
    syllabus:
      "1. Descriptive statistics\n2. Probability distributions\n3. Hypothesis testing\n4. Confidence intervals\n5. Linear regression",
    price: 54.5,
    duration_hours: 16,
    prerequisites: "High-school level math.",
    thumbnail_url: "https://picsum.photos/seed/stats-ds/480/320",
  },
  {
    slug: "ui-design-fundamentals",
    title: "UI Design Fundamentals",
    provider_name: "StudioLoop",
    platform_url: "https://studioloop.example.com/courses/ui-fundamentals",
    category: "Design",
    description:
      "Learn the core principles of user interface design: layout, typography, color, and visual hierarchy.",
    syllabus:
      "1. Design principles\n2. Typography\n3. Color theory\n4. Layout & grids\n5. Building a UI kit",
    price: 45.0,
    duration_hours: 15,
    prerequisites: "None — beginner friendly.",
    thumbnail_url: "https://picsum.photos/seed/ui-fundamentals/480/320",
  },
  {
    slug: "ux-research-methods",
    title: "UX Research Methods",
    provider_name: "StudioLoop",
    platform_url: "https://studioloop.example.com/courses/ux-research",
    category: "Design",
    description:
      "Practical methods for understanding users: interviews, usability testing, surveys, and synthesizing findings.",
    syllabus:
      "1. Research planning\n2. User interviews\n3. Usability testing\n4. Surveys & analysis\n5. Communicating findings",
    price: 64.0,
    duration_hours: 18,
    prerequisites: "None — beginner friendly.",
    thumbnail_url: "https://picsum.photos/seed/ux-research/480/320",
  },
  {
    slug: "figma-for-product-designers",
    title: "Figma for Product Designers",
    provider_name: "PixelCraft School",
    platform_url: "https://pixelcraft.example.com/courses/figma-product",
    category: "Design",
    description:
      "Hands-on Figma training covering components, auto layout, prototyping, and design systems.",
    syllabus:
      "1. Figma interface\n2. Components & variants\n3. Auto layout\n4. Prototyping\n5. Building a design system",
    price: 39.0,
    duration_hours: 11,
    prerequisites: "None — beginner friendly.",
    thumbnail_url: "https://picsum.photos/seed/figma-product/480/320",
  },
  {
    slug: "design-systems-at-scale",
    title: "Design Systems at Scale",
    provider_name: "StudioLoop",
    platform_url: "https://studioloop.example.com/courses/design-systems",
    category: "Design",
    description:
      "Learn how to build, document, and maintain design systems that scale across large product teams.",
    syllabus:
      "1. Why design systems?\n2. Tokens & foundations\n3. Component libraries\n4. Documentation\n5. Governance & versioning",
    price: 79.0,
    duration_hours: 20,
    prerequisites: "Some experience with UI design tools.",
    thumbnail_url: "https://picsum.photos/seed/design-systems/480/320",
  },
  {
    slug: "motion-design-for-interfaces",
    title: "Motion Design for Interfaces",
    provider_name: "PixelCraft School",
    platform_url: "https://pixelcraft.example.com/courses/motion-design",
    category: "Design",
    description:
      "Add purposeful motion to digital products using easing, transitions, and micro-interactions.",
    syllabus:
      "1. Principles of motion\n2. Easing & timing\n3. Micro-interactions\n4. Prototyping motion in Figma\n5. Handoff to engineering",
    price: 49.5,
    duration_hours: 13,
    prerequisites: "Basic UI design knowledge.",
    thumbnail_url: "https://picsum.photos/seed/motion-design/480/320",
  },
];

async function seed() {
  console.log(`Seeding ${courses.length} courses...`);

  for (const c of courses) {
    const [course] = await sql`
      INSERT INTO courses (slug, title, provider_name, platform_url, category)
      VALUES (${c.slug}, ${c.title}, ${c.provider_name}, ${c.platform_url}, ${c.category})
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        provider_name = EXCLUDED.provider_name,
        platform_url = EXCLUDED.platform_url,
        category = EXCLUDED.category
      RETURNING id
    `;

    await sql`
      INSERT INTO course_owner_fields
        (course_id, description, syllabus, price, duration_hours, prerequisites, thumbnail_url, last_edited_by, last_edited_at)
      VALUES
        (${course.id}, ${c.description}, ${c.syllabus}, ${c.price}, ${c.duration_hours}, ${c.prerequisites}, ${c.thumbnail_url}, NULL, NULL)
      ON CONFLICT (course_id) DO UPDATE SET
        description = EXCLUDED.description,
        syllabus = EXCLUDED.syllabus,
        price = EXCLUDED.price,
        duration_hours = EXCLUDED.duration_hours,
        prerequisites = EXCLUDED.prerequisites,
        thumbnail_url = EXCLUDED.thumbnail_url
    `;

    console.log(`  seeded: ${c.title}`);
  }

  console.log("Done.");
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sql.end();
  });
