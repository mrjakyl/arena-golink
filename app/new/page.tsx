import { redirect } from "next/navigation";
import { LinkForm } from "@/components/link-form";
import { getLink } from "@/lib/db";
import { canonicalizeName } from "@/lib/validation";

export const dynamic = "force-dynamic";

export default async function NewPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const { name: raw } = await searchParams;
  const initialName = raw ? canonicalizeName(raw) : "";

  if (initialName) {
    const existing = getLink(initialName);
    if (existing) {
      redirect(`/edit/${encodeURIComponent(existing.name)}`);
    }
  }

  return (
    <LinkForm mode="create" initialName={initialName} miss={Boolean(initialName)} />
  );
}
