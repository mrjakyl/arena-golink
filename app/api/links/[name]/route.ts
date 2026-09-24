import { deleteLink, getLink, updateLink } from "@/lib/db";
import { ApiError, apiResponse, json, readLinkInput, requireMutation, requireTeamApi } from "@/lib/api";
import { canonicalizeName, validateName, validateUpdate } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ name: string }> };

async function resolveName(context: RouteContext): Promise<string> {
  const name = canonicalizeName((await context.params).name);
  const error = validateName(name);
  if (error) throw new ApiError(error, 400);
  return name;
}

export async function GET(_request: Request, context: RouteContext) {
  return apiResponse(async () => {
    await requireTeamApi();
    const link = await getLink(await resolveName(context));
    if (!link) throw new ApiError("Not found", 404);
    return json(link);
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  return apiResponse(async () => {
    await requireMutation(request);
    const name = await resolveName(context);
    const parsed = validateUpdate(await readLinkInput(request));
    if (!parsed.value) throw new ApiError(parsed.error ?? "Invalid link", 400);
    const link = await updateLink(name, { ...parsed.value, updatedAt: new Date().toISOString() });
    if (!link) throw new ApiError("Not found", 404);
    return json(link);
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  return apiResponse(async () => {
    await requireMutation(request);
    if (!(await deleteLink(await resolveName(context)))) throw new ApiError("Not found", 404);
    return json({ ok: true });
  });
}
