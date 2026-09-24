import { test, expect } from "@playwright/test";
import { encode } from "next-auth/jwt";

test("a shortcut leads to Google login and retains its destination", async ({ page }) => {
  await page.goto("/wiki");
  await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fwiki$/);
  await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
  await expect(page.getByRole("link", { name: "New link" })).toHaveCount(0);
  await expect(page).toHaveTitle("Arena Path");
  // Stub only the external provider; exercise the real app's CSRF and sign-in routes.
  await page.route("https://accounts.google.com/**", (route) => route.fulfill({ body: "Google sign-in" }));
  await page.getByRole("button", { name: "Continue with Google" }).click();
  await expect(page).toHaveURL(/https:\/\/accounts\.google\.com\//);
  const oauth = new URL(page.url());
  expect(oauth.searchParams.get("redirect_uri")).toBe("http://127.0.0.1:4318/api/auth/callback/google");
});

test("all private pages require sign-in and malformed query input never crashes", async ({ page }) => {
  for (const path of ["/", "/new", "/edit/wiki", "/setup", "/go/wiki", "/new?name=one&name=two"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login\?callbackUrl=/);
    await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
  }
});

test("anonymous APIs fail closed, including spoofed forwarding headers", async ({ request }) => {
  for (const path of ["/api/links", "/api/links/wiki"]) {
    const response = await request.get(path, { headers: { "x-forwarded-host": "surfingcowarena.com", "x-forwarded-for": "127.0.0.1" } });
    expect(response.status()).toBe(401);
    expect(response.headers()["cache-control"]).toBe("no-store");
  }
  expect((await request.post("/api/links", { data: { name: "wiki", url: "https://example.com" } })).status()).toBe(401);
  expect((await request.patch("/api/links/wiki", { data: { url: "https://example.com" } })).status()).toBe(401);
  expect((await request.delete("/api/links/wiki")).status()).toBe(401);
});

test("signed sessions still require a verified, allowed identity", async ({ context, page }) => {
  for (const token of [
    { email: "outsider@team.example", teamVerified: true },
    { email: "teammate@team.example", teamVerified: false },
  ]) {
    const value = await encode({ secret: "local-browser-test-secret-not-for-deployment", token, maxAge: 3600 });
    await context.addCookies([{ name: "next-auth.session-token", value, url: "http://127.0.0.1:4318", httpOnly: true, sameSite: "Lax" }]);
    await page.goto("/setup");
    await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
  }
});

test("a teammate can use setup and sign out", async ({ context, page }) => {
  // Fixture signed with the local test secret; there is no application auth bypass.
  const value = await encode({
    secret: "local-browser-test-secret-not-for-deployment",
    token: { email: "teammate@team.example", teamVerified: true }, maxAge: 3600,
  });
  await context.addCookies([{ name: "next-auth.session-token", value, url: "http://127.0.0.1:4318", httpOnly: true, sameSite: "Lax" }]);
  await page.goto("/setup");
  await expect(page.getByRole("heading", { name: "Add the browser shortcut" })).toBeVisible();
  await expect(page.getByText("http://127.0.0.1:4318/%s", { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
});

test("health reports unavailable storage without leaking configuration", async ({ request }) => {
  const response = await request.get("/health");
  expect(response.status()).toBe(503);
  expect(await response.json()).toEqual({ ok: false });
});
