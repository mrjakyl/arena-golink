import "server-only";
import { NextResponse } from "next/server";
import { getTeamSession } from "@/lib/auth";
import { allowMutation } from "@/lib/rate-limit";
import type { LinkInput } from "@/lib/validation";

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function apiResponse(action: () => Promise<Response>) {
  try {
    return await action();
  } catch (error) {
    if (error instanceof ApiError) {
      const response = json({ error: error.message }, error.status);
      if (error.status === 429) response.headers.set("Retry-After", "60");
      return response;
    }
    // Do not put database credentials or private link URLs in logs or responses.
    console.error("Link API request failed", error instanceof Error ? error.name : "UnknownError");
    return json({ error: "The service is temporarily unavailable. Please try again." }, 503);
  }
}

export async function requireTeamApi() {
  const session = await getTeamSession();
  if (!session?.user?.email) throw new ApiError("Sign in to continue", 401);
  return session.user.email;
}

export async function requireMutation(request: Request) {
  const email = await requireTeamApi();
  const origin = request.headers.get("origin");
  // Compare with configured canonical origin; never trust forwarded host headers.
  if (!process.env.NEXTAUTH_URL || origin !== new URL(process.env.NEXTAUTH_URL).origin) {
    throw new ApiError("Request origin is not allowed", 403);
  }
  if (!(await allowMutation(email))) throw new ApiError("Too many requests", 429);
}

export async function readLinkInput(request: Request): Promise<LinkInput> {
  if (request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() !== "application/json") {
    throw new ApiError("Use application/json", 415);
  }
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError("Invalid JSON", 400);
  const decoder = new TextDecoder();
  let length = 0;
  let text = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 32_768) {
        await reader.cancel();
        throw new ApiError("Request body is too large", 413);
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    const body: unknown = JSON.parse(text);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new ApiError("Expected a JSON object", 400);
    return body;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Invalid JSON", 400);
  } finally {
    reader.releaseLock();
  }
}
