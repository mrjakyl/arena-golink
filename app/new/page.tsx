import { redirect } from "next/navigation";
import { LinkForm } from "@/components/link-form";
import { getLink } from "@/lib/db";
import { canonicalizeName, firstParam } from "@/lib/validation";
import { requireTeamPage } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NewPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string | string[] }>;
}) {
  const raw = firstParam((await searchParams).name);
  await requireTeamPage(raw ? `/new?name=${encodeURIComponent(raw)}` : "/new");
  const initialName = raw ? canonicalizeName(raw) : "";

  if (initialName) {
    const existing = await getLink(initialName);
    if (existing) {
      redirect(`/edit/${encodeURIComponent(existing.name)}`);
    }
  }

  return (
    <LinkForm mode="create" initialName={initialName} miss={Boolean(initialName)} />
  );
}
