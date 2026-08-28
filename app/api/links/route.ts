import { NextResponse } from "next/server";
import { createLink, listLinks } from "@/lib/db";
import { clientIp, allowMutation } from "@/lib/rate-limit";
import { validateCreate } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  return NextResponse.json(listLinks(), {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  if (!allowMutation(clientIp(request))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = validateCreate(body as Record<string, unknown>);
  if (!parsed.value) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const now = new Date().toISOString();
  const result = createLink({
    ...parsed.value,
    createdAt: now,
    updatedAt: now,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: `“${parsed.value.name}” already exists` },
      { status: 409 },
    );
  }

  return NextResponse.json({ ...parsed.value, createdAt: now, updatedAt: now }, { status: 201 });
}
