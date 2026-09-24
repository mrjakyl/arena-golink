function entries(value: string | undefined): string[] {
  return (value ?? "").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
}

export function isTeamEmail(email: unknown): email is string {
  if (typeof email !== "string") return false;
  const normalized = email.trim().toLowerCase();
  const parts = normalized.split("@");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return false;
  return entries(process.env.AUTH_ALLOWED_EMAILS).includes(normalized) ||
    entries(process.env.AUTH_ALLOWED_DOMAINS).includes(parts[1]);
}

/** Only allow a return path on this app, never an external redirect. */
export function safeReturnPath(value: string | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") ||
    /[\\\x00-\x1f\x7f]/.test(value)) return "/";
  const url = new URL(value, "https://arena.invalid");
  if (url.pathname === "/login" || url.pathname.startsWith("/api/auth")) return "/";
  return `${url.pathname}${url.search}${url.hash}`;
}
