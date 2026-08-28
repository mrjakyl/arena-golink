import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { GoLink } from "./types";

const globalForDb = globalThis as unknown as {
  golinkDb?: DatabaseSync;
};

function openDatabase(): DatabaseSync {
  if (globalForDb.golinkDb) {
    return globalForDb.golinkDb;
  }

  const dir = path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });
  const db = new DatabaseSync(path.join(dir, "golinks.sqlite"));
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS links (
      name TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);

  globalForDb.golinkDb = db;
  return db;
}

function asLink(row: unknown): GoLink {
  const record = row as Record<string, unknown>;
  return {
    name: String(record.name),
    url: String(record.url),
    description: String(record.description ?? ""),
    createdAt: String(record.createdAt),
    updatedAt: String(record.updatedAt),
  };
}

export function listLinks(): GoLink[] {
  const db = openDatabase();
  return db
    .prepare(
      `SELECT name, url, description, createdAt, updatedAt
       FROM links
       ORDER BY name COLLATE NOCASE ASC`,
    )
    .all()
    .map(asLink);
}

export function getLink(name: string): GoLink | undefined {
  const db = openDatabase();
  const row = db
    .prepare(
      `SELECT name, url, description, createdAt, updatedAt
       FROM links
       WHERE name = ?`,
    )
    .get(name);
  return row ? asLink(row) : undefined;
}

export function createLink(link: GoLink): { ok: true } | { ok: false; reason: "duplicate" } {
  const db = openDatabase();
  try {
    db.prepare(
      `INSERT INTO links (name, url, description, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?)`,
    ).run(link.name, link.url, link.description, link.createdAt, link.updatedAt);
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (/UNIQUE constraint failed/i.test(message)) {
      return { ok: false, reason: "duplicate" };
    }
    throw error;
  }
}

export function updateLink(
  name: string,
  fields: { url: string; description: string; updatedAt: string },
): boolean {
  const db = openDatabase();
  const result = db
    .prepare(
      `UPDATE links
       SET url = ?, description = ?, updatedAt = ?
       WHERE name = ?`,
    )
    .run(fields.url, fields.description, fields.updatedAt, name);
  return result.changes > 0;
}

export function deleteLink(name: string): boolean {
  const db = openDatabase();
  const result = db.prepare(`DELETE FROM links WHERE name = ?`).run(name);
  return result.changes > 0;
}
