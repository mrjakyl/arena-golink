import assert from "node:assert/strict";
import { test } from "node:test";
import { canonicalizeName, firstParam, validateCreate, validateUpdate } from "../lib/validation.ts";

test("Unicode destinations serialize into valid redirect headers on create and update", () => {
  const result = validateCreate({ name: " WIKI ", url: "https://例え.jp/🙂", description: " Docs " });
  assert.deepEqual(result.value, { name: "wiki", url: "https://xn--r8jz45g.jp/%F0%9F%99%82", description: "Docs" });
  assert.doesNotThrow(() => new Response(null, { status: 302, headers: { Location: result.value.url } }));
  assert.equal(validateUpdate({ url: "https://example.com/🙂" }).value.url, "https://example.com/%F0%9F%99%82");
});

test("unsafe destinations are rejected before they can break a redirect", () => {
  for (const url of ["javascript:alert(1)", "data:text/html,hello", "file:///etc/passwd", "//example.com",
    "https:example.com", "https://user:password@example.com", "https://example.com/a\r\nX-Test: yes",
    "https://example.com/a\u0000b", "https://example.com/" + "a".repeat(4096)]) {
    assert.ok(validateCreate({ name: "wiki", url }).error, url);
    assert.ok(validateUpdate({ url }).error, url);
  }
});

test("names and descriptions obey shared-directory limits", () => {
  for (const name of ["", "new", "login", "api", "-wiki", "wiki-", "two words", "a".repeat(65)]) {
    assert.ok(validateCreate({ name, url: "https://example.com" }).error);
  }
  assert.ok(validateCreate({ name: "a".repeat(64), url: "https://example.com" }).value);
  assert.ok(validateUpdate({ url: "https://example.com", description: "a".repeat(501) }).error);
});

test("omnibox input and repeated query values keep the intended alias", () => {
  assert.equal(canonicalizeName(" WIKI+extra "), "wiki");
  assert.equal(canonicalizeName("WIKI%20extra"), "wiki");
  assert.equal(canonicalizeName("bad%encoding"), "bad%encoding");
  assert.equal(canonicalizeName(firstParam(["WIKI", "other"])), "wiki");
  assert.equal(firstParam(undefined), undefined);
});
