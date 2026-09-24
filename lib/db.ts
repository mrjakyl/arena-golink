import "server-only";
import { neon } from "@neondatabase/serverless";
import type { GoLink } from "./types";

// Construct lazily so builds never require database credentials or access.
export async function query(text: string, parameters: unknown[] = []) {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");
  return neon(url).query(text, parameters);
}

function asLink(row: Record<string, unknown>): GoLink {
  return {
    name: String(row.name),
    url: String(row.url),
    description: String(row.description),
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
  };
}

export async function listLinks(): Promise<GoLink[]> {
  const rows = await query('SELECT name, url, description, "createdAt", "updatedAt" FROM links ORDER BY name');
  return rows.map(asLink);
}

export async function getLink(name: string): Promise<GoLink | undefined> {
  const rows = await query('SELECT name, url, description, "createdAt", "updatedAt" FROM links WHERE name = $1', [name]);
  return rows[0] ? asLink(rows[0]) : undefined;
}

export async function createLink(link: GoLink): Promise<{ ok: true } | { ok: false; reason: "duplicate" }> {
  const rows = await query(
    `INSERT INTO links (name, url, description, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5) ON CONFLICT (name) DO NOTHING RETURNING name`,
    [link.name, link.url, link.description, link.createdAt, link.updatedAt],
  );
  return rows.length ? { ok: true } : { ok: false, reason: "duplicate" };
}

export async function updateLink(
  name: string,
  fields: { url: string; description: string; updatedAt: string },
): Promise<GoLink | undefined> {
  const rows = await query(
    `UPDATE links SET url = $1, description = $2, "updatedAt" = $3
     WHERE name = $4 RETURNING name, url, description, "createdAt", "updatedAt"`,
    [fields.url, fields.description, fields.updatedAt, name],
  );
  return rows[0] ? asLink(rows[0]) : undefined;
}

export async function deleteLink(name: string): Promise<boolean> {
  const rows = await query("DELETE FROM links WHERE name = $1 RETURNING name", [name]);
  return rows.length > 0;
}

export async function checkDatabase(): Promise<void> {
  await query("SELECT 1 FROM links LIMIT 1");
}
