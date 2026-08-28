import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return new NextResponse(null, {
    status: 302,
    headers: {
      Location: "/",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
