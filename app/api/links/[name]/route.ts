import { NextResponse } from "next/server";
import { deleteLink, getLink, updateLink } from "@/lib/db";
import { clientIp, allowMutation } from "@/lib/rate-limit";
import { canonicalizeName, validateName, validateUpdate } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const runtime = "nodejs";
export const revalidate = 0;

type RouteContext = { params: Promise<{ name: string }> };

function resolveName(raw: string): { name?: string; error?: string; status?: number } {
  const name = canonicalizeName(raw);
  const error = validateName(name);
  if (!name || error) {
    return { error: error || "Name is required", status: 400 };
  }
  return { name };
}

export async function GET(_request: Request, context: RouteContext) {
  const { name: raw } = await context.params;
  const resolved = resolveName(raw);
  if (!resolved.name) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }
  const link = getLink(resolved.name);
  if (!link) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(link, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!allowMutation(clientIp(request))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { name: raw } = await context.params;
  const resolved = resolveName(raw);
  if (!resolved.name) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
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

  const parsed = validateUpdate(body as Record<string, unknown>);
  if (!parsed.value) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const updated = updateLink(resolved.name, {
    ...parsed.value,
    updatedAt: new Date().toISOString(),
  });
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const link = getLink(resolved.name);
  return NextResponse.json(link);
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!allowMutation(clientIp(request))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { name: raw } = await context.params;
  const resolved = resolveName(raw);
  if (!resolved.name) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const deleted = deleteLink(resolved.name);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
