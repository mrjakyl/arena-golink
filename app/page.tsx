import { Suspense } from "react";
import { Directory } from "@/components/directory";
import { Flash } from "@/components/flash";
import { listLinks } from "@/lib/db";
import { requireTeamPage } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await requireTeamPage("/");
  const links = await listLinks();

  return (
    <>
      <Suspense fallback={null}>
        <Flash />
      </Suspense>
      <Directory links={links} />
    </>
  );
}
