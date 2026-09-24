import NextAuth from "next-auth";
import { authConfigured, authOptions } from "@/lib/auth";
import { json } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = NextAuth(authOptions);

async function auth(request: Request, context: { params: Promise<{ nextauth: string[] }> }) {
  if (!authConfigured()) return json({ error: "Sign-in is not configured" }, 503);
  return handler(request, context);
}

export { auth as GET, auth as POST };
