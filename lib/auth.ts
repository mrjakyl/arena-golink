import "server-only";
import { getServerSession, type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { redirect } from "next/navigation";
import { isTeamEmail, safeReturnPath } from "@/lib/access";

export function authConfigured(): boolean {
  return Boolean(process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_URL &&
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET &&
    (process.env.AUTH_ALLOWED_EMAILS?.trim() || process.env.AUTH_ALLOWED_DOMAINS?.trim()));
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  })],
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    async signIn({ account, profile }) {
      return authConfigured() && account?.provider === "google" &&
        profile?.email_verified === true && isTeamEmail(profile.email);
    },
    async jwt({ token, account, profile }) {
      if (account) {
        token.teamVerified = account.provider === "google" && profile?.email_verified === true;
        token.email = profile?.email?.toLowerCase();
      }
      return token;
    },
    async session({ session, token }) {
      // Recheck the allowlist on every request, including existing sessions.
      if (token.teamVerified !== true || !isTeamEmail(token.email)) {
        delete session.user;
      } else if (session.user) {
        session.user.email = token.email;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      try {
        const target = new URL(url, baseUrl);
        if (target.origin === new URL(baseUrl).origin) {
          return `${baseUrl}${safeReturnPath(target.pathname + target.search + target.hash)}`;
        }
      } catch { /* Invalid callback URLs return to the directory. */ }
      return baseUrl;
    },
  },
};

export async function getTeamSession() {
  if (!authConfigured()) return null;
  const session = await getServerSession(authOptions);
  return isTeamEmail(session?.user?.email) ? session : null;
}

export async function requireTeamPage(returnTo: string) {
  const session = await getTeamSession();
  if (!session) redirect(`/login?callbackUrl=${encodeURIComponent(safeReturnPath(returnTo))}`);
  return session;
}
