import { NextResponse } from "next/server";
import { getLink } from "@/lib/db";
import { canonicalizeName } from "@/lib/validation";

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

export function redirectForName(raw: string) {
  const name = canonicalizeName(raw);

  if (!name) {
    return redirectTo("/");
  }

  const link = getLink(name);
  if (link) {
    return redirectTo(link.url);
  }

  return redirectTo(`/new?name=${encodeURIComponent(name)}`);
}
