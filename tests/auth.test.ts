import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { isTeamEmail, safeReturnPath } from "@/lib/access";
import { authOptions, getTeamSession } from "@/lib/auth";
import { getServerSession } from "next-auth";

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));

beforeEach(() => {
  vi.stubEnv("AUTH_ALLOWED_DOMAINS", "team.example");
  vi.stubEnv("AUTH_ALLOWED_EMAILS", "guest@partner.example");
  vi.stubEnv("NEXTAUTH_URL", "https://surfingcowarena.com");
  vi.stubEnv("NEXTAUTH_SECRET", "test-secret");
  vi.stubEnv("GOOGLE_CLIENT_ID", "test-client");
  vi.stubEnv("GOOGLE_CLIENT_SECRET", "test-client-secret");
});
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });

describe("team authorization", () => {
  it("matches full emails and exact domains, never suffixes", () => {
    expect(isTeamEmail("Person@TEAM.EXAMPLE")).toBe(true);
    expect(isTeamEmail("guest@partner.example")).toBe(true);
    for (const email of ["person@evilteam.example", "person@sub.team.example", "guest@partner.example.evil", undefined]) {
      expect(isTeamEmail(email)).toBe(false);
    }
    vi.stubEnv("AUTH_ALLOWED_EMAILS", "");
    vi.stubEnv("AUTH_ALLOWED_DOMAINS", "");
    expect(isTeamEmail("person@team.example")).toBe(false);
  });

  it("requires a verified Google email at sign-in", async () => {
    const signIn = authOptions.callbacks!.signIn!;
    const input = {
      user: { id: "123" },
      account: { provider: "google", providerAccountId: "123", type: "oauth" as const },
      profile: { email: "person@team.example", email_verified: true },
    };
    expect(await signIn(input)).toBe(true);
    expect(await signIn({ ...input, profile: { ...input.profile, email_verified: false } })).toBe(false);
    expect(await signIn({ ...input, profile: { ...input.profile, email: "outsider@example.net" } })).toBe(false);
    expect(await signIn({ ...input, account: { ...input.account, provider: "other" } })).toBe(false);
    vi.stubEnv("NEXTAUTH_SECRET", "");
    expect(await signIn(input)).toBe(false);
  });

  it("revokes sessions when a teammate leaves the allowlist", async () => {
    const callback = authOptions.callbacks!.session!;
    const session = { user: { email: "person@team.example" }, expires: "2099-01-01" };
    const token = { email: session.user.email, teamVerified: true };
    const input = { session, token } as Parameters<typeof callback>[0];
    expect((await callback(input)).user?.email).toBe(token.email);
    vi.stubEnv("AUTH_ALLOWED_DOMAINS", "new-team.example");
    expect((await callback(input)).user).toBeUndefined();
  });

  it("does not trust a session without the verified identity marker", async () => {
    const callback = authOptions.callbacks!.session!;
    const result = await callback({
      session: { user: { email: "person@team.example" }, expires: "2099-01-01" },
      token: { email: "person@team.example" },
    } as Parameters<typeof callback>[0]);
    expect(result.user).toBeUndefined();
  });

  it("fails closed before reading sessions when configuration is missing", async () => {
    vi.stubEnv("NEXTAUTH_SECRET", "");
    expect(await getTeamSession()).toBeNull();
    expect(getServerSession).not.toHaveBeenCalled();
  });
});

describe("login return paths", () => {
  it.each(["https://evil.example", "//evil.example", "/\\evil.example", "/\n/evil.example", "/login", "/api/auth/signin"])("rejects %s", (url) => {
    expect(safeReturnPath(url)).toBe("/");
  });
  it("preserves the intended shortcut and create form", () => {
    expect(safeReturnPath("/go/wiki")).toBe("/go/wiki");
    expect(safeReturnPath("/new?name=wiki")).toBe("/new?name=wiki");
  });
});
