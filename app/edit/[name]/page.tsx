import { notFound, redirect } from "next/navigation";
import { LinkForm } from "@/components/link-form";
import { getLink } from "@/lib/db";
import { canonicalizeName } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export default async function EditPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name: raw } = await params;
  const name = canonicalizeName(raw);
  if (!name) {
    notFound();
  }

  const link = getLink(name);
  if (!link) {
    redirect(`/new?name=${encodeURIComponent(name)}`);
  }

  return <LinkForm mode="edit" link={link} />;
}
