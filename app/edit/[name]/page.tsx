import { notFound, redirect } from "next/navigation";
import { LinkForm } from "@/components/link-form";
import { getLink } from "@/lib/db";
import { canonicalizeName } from "@/lib/validation";
import { requireTeamPage } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function EditPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name: raw } = await params;
  await requireTeamPage(`/edit/${encodeURIComponent(raw)}`);
  const name = canonicalizeName(raw);
  if (!name) {
    notFound();
  }

  const link = await getLink(name);
  if (!link) {
    redirect(`/new?name=${encodeURIComponent(name)}`);
  }

  return <LinkForm mode="edit" link={link} />;
}
