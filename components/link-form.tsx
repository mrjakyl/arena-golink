"use client";

import {
  Button,
  Callout,
  Flex,
  Heading,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { GoLink } from "@/lib/types";
import { normalizeSubmittedName, URL_MAX } from "@/lib/validation";

type CreateProps = {
  mode: "create";
  initialName?: string;
  miss?: boolean;
};

type EditProps = {
  mode: "edit";
  link: GoLink;
};

type Props = CreateProps | EditProps;

export function LinkForm(props: Props) {
  const router = useRouter();
  const isEdit = props.mode === "edit";
  const [name, setName] = useState(isEdit ? props.link.name : (props.initialName ?? ""));
  const [url, setUrl] = useState(isEdit ? props.link.url : "");
  const [description, setDescription] = useState(isEdit ? props.link.description : "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const title = isEdit
    ? `Edit go/${props.link.name}`
    : props.miss && props.initialName
      ? `“${props.initialName}” isn’t a go link yet`
      : "New go link";

  const subtitle = isEdit
    ? "The name stays the same so shortcuts people already use keep working."
    : props.miss
      ? "Create it now. After that, go + Tab + this name will land on the URL."
      : "Pick a short name people will type after go.";

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    try {
      if (isEdit) {
        const response = await fetch(`/api/links/${encodeURIComponent(props.link.name)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, description }),
        });
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        if (!response.ok) {
          throw new Error(body?.error || "Could not save");
        }
        router.push(`/?updated=${encodeURIComponent(props.link.name)}`);
        router.refresh();
        return;
      }

      const canonical = normalizeSubmittedName(name);
      const response = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: canonical, url, description }),
      });
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(body?.error || "Could not save");
      }
      router.push(`/?created=${encodeURIComponent(canonical)}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
      setSaving(false);
    }
  }

  return (
    <Flex direction="column" gap="4" style={{ maxWidth: 560 }}>
      <div>
        <Heading size="7">{title}</Heading>
        <Text as="p" color="gray" mt="2">
          {subtitle}
        </Text>
      </div>

      {error ? (
        <Callout.Root color="red" variant="surface" role="alert">
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      ) : null}

      <form onSubmit={onSubmit}>
        <Flex direction="column" gap="3">
          <label>
            <Text as="div" size="2" weight="medium" mb="1">
              Name
            </Text>
            <TextField.Root
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="payroll"
              maxLength={64}
              required
              disabled={isEdit}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              size="3"
            >
              <TextField.Slot className="name-pill">go/</TextField.Slot>
            </TextField.Root>
            <Text as="p" size="1" color="gray" mt="1">
              Lowercase letters, digits, hyphens. 1–64 characters.
            </Text>
          </label>

          <label>
            <Text as="div" size="2" weight="medium" mb="1">
              URL
            </Text>
            <TextField.Root
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://"
              required
              type="text"
              inputMode="url"
              maxLength={URL_MAX}
              autoComplete="off"
              size="3"
            />
          </label>

          <label>
            <Text as="div" size="2" weight="medium" mb="1">
              Description <Text color="gray">optional</Text>
            </Text>
            <TextArea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What this opens, in a few words"
              rows={3}
              maxLength={500}
            />
          </label>

          <Flex gap="3" mt="2">
            <Button type="submit" highContrast disabled={saving} size="3">
              {saving ? "Saving…" : isEdit ? "Save changes" : "Create link"}
            </Button>
            <Button asChild variant="soft" color="gray" size="3">
              <NextLink href="/">Cancel</NextLink>
            </Button>
          </Flex>
        </Flex>
      </form>
    </Flex>
  );
}
