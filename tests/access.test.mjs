import assert from "node:assert/strict";
import { beforeEach, afterEach, test } from "node:test";
import { isTeamEmail, safeReturnPath } from "../lib/access.ts";

const keys = ["AUTH_ALLOWED_EMAILS", "AUTH_ALLOWED_DOMAINS"];
const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
beforeEach(() => {
  process.env.AUTH_ALLOWED_DOMAINS = "team.example";
  process.env.AUTH_ALLOWED_EMAILS = "guest@partner.example";
});
afterEach(() => {
  for (const key of keys) {
    if (original[key] === undefined) delete process.env[key];
    else process.env[key] = original[key];
  }
});

test("team access matches exact addresses or domains, never lookalikes", () => {
  assert.equal(isTeamEmail("Person@TEAM.EXAMPLE"), true);
  assert.equal(isTeamEmail("guest@partner.example"), true);
  for (const email of ["person@evilteam.example", "person@sub.team.example", "guest@partner.example.evil", undefined]) {
    assert.equal(isTeamEmail(email), false);
  }
});

test("empty allowlists deny access", () => {
  process.env.AUTH_ALLOWED_EMAILS = "";
  process.env.AUTH_ALLOWED_DOMAINS = "";
  assert.equal(isTeamEmail("person@team.example"), false);
});

test("login returns to the requested shortcut, never an external site", () => {
  for (const url of ["https://evil.example", "//evil.example", "/\\evil.example", "/\n/evil.example", "/login", "/api/auth/signin"]) {
    assert.equal(safeReturnPath(url), "/");
  }
  assert.equal(safeReturnPath("/go/wiki"), "/go/wiki");
  assert.equal(safeReturnPath("/new?name=wiki"), "/new?name=wiki");
});
