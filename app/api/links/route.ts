import { createLink, listLinks } from "@/lib/db";
import { ApiError, apiResponse, json, readLinkInput, requireMutation, requireTeamApi } from "@/lib/api";
import { validateCreate } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return apiResponse(async () => {
    await requireTeamApi();
    return json(await listLinks());
  });
}

export async function POST(request: Request) {
  return apiResponse(async () => {
    await requireMutation(request);
    const parsed = validateCreate(await readLinkInput(request));
    if (!parsed.value) throw new ApiError(parsed.error ?? "Invalid link", 400);
    const now = new Date().toISOString();
    const link = { ...parsed.value, createdAt: now, updatedAt: now };
    const result = await createLink(link);
    if (!result.ok) throw new ApiError(`“${link.name}” already exists`, 409);
    return json(link, 201);
  });
}
