import { readdir, readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL before running migrations");
const sql = neon(process.env.DATABASE_URL);
await sql.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
  name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
)`);
const applied = new Set((await sql.query("SELECT name FROM schema_migrations")).map((row) => row.name));
const directory = new URL("../migrations/", import.meta.url);
for (const name of (await readdir(directory)).filter((name) => name.endsWith(".sql")).sort()) {
  if (applied.has(name)) continue;
  const source = await readFile(new URL(name, directory), "utf8");
  const statements = source.split("-- statement-breakpoint").map((s) => s.trim()).filter(Boolean);
  await sql.transaction([
    ...statements.map((statement) => sql.query(statement)),
    sql.query("INSERT INTO schema_migrations (name) VALUES ($1)", [name]),
  ]);
  console.log(`Applied ${name}`);
}
console.log("Database migrations complete");
