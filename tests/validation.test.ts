import { describe, expect, it } from "vitest";
import { canonicalizeName, firstParam, validateCreate, validateName, validateUpdate } from "@/lib/validation";

describe("link validation", () => {
  it("normalizes a name and serializes international URLs for Location headers", () => {
    const result = validateCreate({ name: " WIKI ", url: " https://例え.jp/🙂 ", description: " Docs " });
    expect(result.value).toMatchObject({ name: "wiki", description: "Docs", url: "https://xn--r8jz45g.jp/%F0%9F%99%82" });
    expect(() => new Response(null, { status: 302, headers: { Location: result.value!.url } })).not.toThrow();
    expect(validateUpdate({ url: "https://example.com/🙂" }).value?.url).toBe("https://example.com/%F0%9F%99%82");
  });

  it.each([
    "javascript:alert(1)", "data:text/html,hello", "file:///etc/passwd", "//example.com",
    "https:example.com", "https://user:password@example.com", "https://example.com/a\r\nX-Test: yes",
    "https://example.com/a\u0000b", "https://example.com/" + "a".repeat(4096),
  ])("rejects unsafe or invalid destination %s", (url) => {
    expect(validateCreate({ name: "wiki", url }).error).toBeTruthy();
    expect(validateUpdate({ url }).error).toBeTruthy();
  });

  it.each(["", "new", "login", "api", "-wiki", "wiki-", "two words", "a".repeat(65)])("rejects invalid or reserved name %s", (name) => {
    expect(validateName(name)).toBeTruthy();
  });

  it("keeps submitted names strict but normalizes omnibox queries", () => {
    expect(validateCreate({ name: "wiki docs", url: "https://example.com" }).error).toBeTruthy();
    expect(canonicalizeName(" WIKI+extra ")).toBe("wiki");
    expect(canonicalizeName("WIKI%20extra")).toBe("wiki");
    expect(canonicalizeName("bad%encoding")).toBe("bad%encoding");
    expect(firstParam(["wiki", "other"])).toBe("wiki");
    expect(firstParam(undefined)).toBeUndefined();
  });

  it("bounds descriptions", () => {
    expect(validateUpdate({ url: "https://example.com", description: "a".repeat(501) }).error).toBeTruthy();
    expect(validateName("a".repeat(64))).toBeNull();
  });
});
