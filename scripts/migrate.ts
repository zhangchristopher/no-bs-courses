import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import postgres from "postgres";

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const sql = postgres(process.env.DATABASE_URL!, { ssl: "require" });

async function migrate() {
  const dir = path.join(__dirname, "..", "migrations");
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    console.log(`Applying ${file}...`);
    await sql.file(path.join(dir, file));
  }

  console.log("Migrations applied.");
}

migrate()
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sql.end();
  });
