import { NextResponse } from "next/server";
import { listLinks } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  try {
    listLinks();
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
