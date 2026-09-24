import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, beforeEach, afterAll, expect, it, vi } from "vitest";
import { neon } from "@neondatabase/serverless";
import { getTeamSession, requireTeamPage } from "@/lib/auth";
import { GET as list, POST as create } from "@/app/api/links/route";
import { GET as read, PATCH as update, DELETE as remove } from "@/app/api/links/[name]/route";
import { GET as shortRedirect } from "@/app/[name]/route";
import { GET as goRedirect } from "@/app/go/[name]/route";
import { GET as health } from "@/app/health/route";
import NewPage from "@/app/new/page";
import { allowMutation } from "@/lib/rate-limit";

vi.mock("@neondatabase/serverless", () => ({ neon: vi.fn() }));
vi.mock("@/lib/auth", () => ({ getTeamSession: vi.fn(), requireTeamPage: vi.fn() }));

const db = new PGlite();
const origin = "https://surfingcowarena.com";
const teammate = { user: { email: "person@team.example" }, expires: "2099-01-01" };
const context = (name: string) => ({ params: Promise.resolve({ name }) });
const request = (method = "GET", body?: unknown, headers: Record<string, string> = {}) =>
  new Request(`${origin}/api/links`, {
    method,
    headers: { origin, "content-type": "application/json", ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

beforeAll(async () => {
  await db.exec(await readFile(new URL("../migrations/001_initial.sql", import.meta.url), "utf8"));
  vi.mocked(neon).mockReturnValue({
    query: async (sql: string, parameters: unknown[]) => (await db.query(sql, parameters)).rows,
  } as unknown as ReturnType<typeof neon>);
});
beforeEach(async () => {
  vi.stubEnv("DATABASE_URL", "postgresql://test:test@localhost/test");
  vi.stubEnv("NEXTAUTH_URL", origin);
  vi.mocked(getTeamSession).mockResolvedValue(teammate);
  vi.mocked(requireTeamPage).mockResolvedValue(teammate);
  await db.exec("TRUNCATE links, mutation_limits");
});
afterAll(async () => { await db.close(); vi.unstubAllEnvs(); });

it("creates, searches via directory data, redirects, edits, and deletes a shared shortcut", async () => {
  expect(await (await list()).json()).toEqual([]);
  const created = await create(request("POST", { name: " WIKI ", url: "https://docs.example/🙂", description: "Team handbook" }));
  expect(created.status).toBe(201);
  const link = await created.json();
  expect(link).toMatchObject({ name: "wiki", url: "https://docs.example/%F0%9F%99%82", description: "Team handbook" });
  expect((await (await list()).json())[0]).toEqual(link);
  expect(await (await read(request(), context("WIKI"))).json()).toEqual(link);
  expect((await create(request("POST", { name: "wiki", url: "https://other.example" }))).status).toBe(409);
  for (const redirect of [shortRedirect, goRedirect]) {
    const response = await redirect(request(), context("WIKI extra"));
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(link.url);
    expect(response.headers.get("cache-control")).toContain("no-store");
  }
  const updated = await update(request("PATCH", { name: "renamed", url: "https://new-docs.example", description: "Updated handbook" }), context("wiki"));
  expect(updated.status).toBe(200);
  expect(await updated.json()).toMatchObject({ name: "wiki", createdAt: link.createdAt, description: "Updated handbook" });
  expect((await shortRedirect(request(), context("wiki"))).headers.get("location")).toBe("https://new-docs.example/");
  expect((await remove(request("DELETE"), context("wiki"))).status).toBe(200);
  expect(await (await list()).json()).toEqual([]);
  expect((await shortRedirect(request(), context("wiki"))).headers.get("location")).toBe("/new?name=wiki");
});

it("does not expose data or change links without a team session", async () => {
  vi.mocked(getTeamSession).mockResolvedValue(null);
  for (const response of [await list(), await create(request("POST", {})), await read(request(), context("wiki")),
    await update(request("PATCH", {}), context("wiki")), await remove(request("DELETE"), context("wiki"))]) {
    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toBe("no-store");
  }
  expect((await shortRedirect(request(), context("wiki"))).headers.get("location")).toBe("/login?callbackUrl=%2Fwiki");
  expect((await goRedirect(request(), context("wiki"))).headers.get("location")).toBe("/login?callbackUrl=%2Fgo%2Fwiki");
  expect((await db.query("SELECT * FROM mutation_limits")).rows).toHaveLength(0);
});

it("rejects cross-origin mutations even with a valid session", async () => {
  for (const origin of ["https://evil.example", "null", ""]) {
    expect((await create(request("POST", {}, { origin }))).status).toBe(403);
    expect((await remove(request("DELETE", undefined, { origin }), context("wiki"))).status).toBe(403);
  }
});

it("returns clear errors for invalid, oversized, and non-JSON bodies", async () => {
  expect((await create(request("POST", [], {}))).status).toBe(400);
  expect((await create(request("POST", {}, { "content-type": "text/plain" }))).status).toBe(415);
  expect((await create(request("POST", { description: "a".repeat(33_000) }))).status).toBe(413);
  const invalid = new Request(`${origin}/api/links`, { method: "POST", headers: { origin, "content-type": "application/json" }, body: "{" });
  expect((await create(invalid)).status).toBe(400);
  expect((await create(request("POST", { name: "login", url: "https://example.com" }))).status).toBe(400);
  expect((await update(request("PATCH", { url: "https://example.com" }), context("missing"))).status).toBe(404);
});

it("enforces a shared atomic rate limit and resets expired windows", async () => {
  const attempts = await Promise.all(Array.from({ length: 65 }, () => allowMutation(teammate.user.email)));
  expect(attempts.filter(Boolean)).toHaveLength(60);
  const response = await create(request("POST", { name: "wiki", url: "https://example.com" }));
  expect(response.status).toBe(429);
  expect(response.headers.get("retry-after")).toBe("60");
  expect(await allowMutation("another@team.example")).toBe(true);
  await db.exec(`UPDATE mutation_limits SET "resetAt" = now() - interval '1 second'`);
  expect(await allowMutation(teammate.user.email)).toBe(true);
});

it("handles repeated name query parameters and preserves the missing-name form", async () => {
  const page = await NewPage({ searchParams: Promise.resolve({ name: ["WIKI", "other"] }) });
  expect(page.props).toMatchObject({ mode: "create", initialName: "wiki", miss: true });
  expect(requireTeamPage).toHaveBeenCalledWith("/new?name=WIKI");
});

it("checks database readiness without returning private data", async () => {
  expect(await (await health()).json()).toEqual({ ok: true });
  vi.stubEnv("DATABASE_URL", "");
  const unavailable = await health();
  expect(unavailable.status).toBe(503);
  expect(await unavailable.json()).toEqual({ ok: false });
  expect(unavailable.headers.get("cache-control")).toBe("no-store");
  const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
  expect((await list()).status).toBe(503);
  errorLog.mockRestore();
});
