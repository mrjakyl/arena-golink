import { NextResponse } from "next/server";
import { getLink } from "@/lib/db";
import { canonicalizeName } from "@/lib/validation";
import { getTeamSession } from "@/lib/auth";
import { safeReturnPath } from "@/lib/access";

const NO_STORE = "no-store, no-cache, must-revalidate";

export function redirectTo(location: string) {
  return new NextResponse(null, {
    status: 302,
    headers: {
      Location: location,
      "Cache-Control": NO_STORE,
    },
  });
}

export async function redirectForName(raw: string, returnTo: string) {
  if (!(await getTeamSession())) {
    return redirectTo(`/login?callbackUrl=${encodeURIComponent(safeReturnPath(returnTo))}`);
  }
  const name = canonicalizeName(raw);

  if (!name) {
    return redirectTo("/");
  }

  const link = await getLink(name);
  if (link) {
    return redirectTo(link.url);
  }

  return redirectTo(`/new?name=${encodeURIComponent(name)}`);
}
