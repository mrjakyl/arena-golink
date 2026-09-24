import { redirectForName } from "@/lib/redirect";

export const dynamic = "force-dynamic";

export async function GET() {
  return redirectForName("", "/go");
}
