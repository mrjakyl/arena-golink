import { Suspense } from "react";
import { Directory } from "@/components/directory";
import { Flash } from "@/components/flash";
import { listLinks } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const links = listLinks();

  return (
    <>
      <Suspense fallback={null}>
        <Flash />
      </Suspense>
      <Directory links={links} />
    </>
  );
}
