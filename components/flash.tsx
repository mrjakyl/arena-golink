"use client";

import { Callout } from "@radix-ui/themes";
import { CheckCircledIcon } from "@radix-ui/react-icons";
import { useSearchParams } from "next/navigation";

export function Flash() {
  const params = useSearchParams();
  const created = params.get("created");
  const updated = params.get("updated");
  const deleted = params.get("deleted");

  let message: string | null = null;
  if (created) message = `Saved “${created}”`;
  else if (updated) message = `Updated “${updated}”`;
  else if (deleted) message = `Deleted “${deleted}”`;

  if (!message) return null;

  return (
    <Callout.Root color="gray" highContrast variant="surface" mb="4" className="flash">
      <Callout.Icon>
        <CheckCircledIcon />
      </Callout.Icon>
      <Callout.Text>{message}</Callout.Text>
    </Callout.Root>
  );
}
