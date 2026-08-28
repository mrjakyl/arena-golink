import { redirectForName } from "@/lib/redirect";

export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const runtime = "nodejs";
export const revalidate = 0;

export async function GET(
  _request: Request,
  context: { params: Promise<{ name: string }> },
) {
  const { name } = await context.params;
  return redirectForName(name);
}
