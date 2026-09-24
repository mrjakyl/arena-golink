"use client";

import {
  AlertDialog,
  Button,
  DropdownMenu,
  Flex,
  Heading,
  Link as RadixLink,
  Table,
  Text,
  TextField,
} from "@radix-ui/themes";
import { DotsHorizontalIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import NextLink from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { GoLink } from "@/lib/types";

export function Directory({ links }: { links: GoLink[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState<GoLink | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return links;
    return links.filter(
      (link) =>
        link.name.includes(q) ||
        link.description.toLowerCase().includes(q) ||
        link.url.toLowerCase().includes(q),
    );
  }, [links, query]);

  async function confirmDelete() {
    const target = pendingDelete;
    if (!target) return;
    setDeleting(true);
    setError(null);
    try {
      const response = await fetch(`/api/links/${encodeURIComponent(target.name)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error || "Could not delete");
      }
      setPendingDelete(null);
      router.replace(`/?deleted=${encodeURIComponent(target.name)}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete");
    } finally {
      setDeleting(false);
    }
  }

  if (links.length === 0) {
    return (
      <Flex direction="column" align="start" gap="4" mt="4">
        <Heading size="8">Arena Path</Heading>
        <Text size="4" color="gray" style={{ maxWidth: 520 }}>
          Memorable shortcuts to your team’s resources, shared in one place.
        </Text>
        <Flex gap="3" mt="2" wrap="wrap">
          <Button asChild size="3" highContrast>
            <NextLink href="/new">New link</NextLink>
          </Button>
          <Button asChild size="3" variant="soft" color="gray">
            <NextLink href="/setup">Add the browser shortcut</NextLink>
          </Button>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="4">
      <Flex align="center" justify="between" gap="3" wrap="wrap">
        <div>
          <Heading size="7">Directory</Heading>
          <Text size="2" color="gray">
            {links.length} {links.length === 1 ? "link" : "links"} · your team can add or edit
          </Text>
        </div>
      </Flex>

      <TextField.Root
        aria-label="Search links"
        placeholder="Search names and descriptions"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        size="3"
      >
        <TextField.Slot>
          <MagnifyingGlassIcon height="16" width="16" />
        </TextField.Slot>
      </TextField.Root>

      {error ? (
        <Text size="2" color="red" role="alert">
          {error}
        </Text>
      ) : null}

      {filtered.length === 0 ? (
        <Text color="gray">No links match “{query}”.</Text>
      ) : (
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>URL</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Description</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filtered.map((link) => (
              <Table.Row key={link.name}>
                <Table.RowHeaderCell>
                  <RadixLink asChild weight="medium">
                    <a href={`/${encodeURIComponent(link.name)}`} className="name-pill">
                      go/{link.name}
                    </a>
                  </RadixLink>
                </Table.RowHeaderCell>
                <Table.Cell>
                  <RadixLink
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="url-cell"
                    color="gray"
                  >
                    {link.url}
                  </RadixLink>
                </Table.Cell>
                <Table.Cell>
                  <Text color={link.description ? undefined : "gray"} size="2">
                    {link.description || "—"}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      <Button variant="ghost" color="gray" size="1" aria-label={`Actions for ${link.name}`}>
                        <DotsHorizontalIcon />
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content align="end">
                      <DropdownMenu.Item asChild>
                        <a href={`/${encodeURIComponent(link.name)}`}>Open</a>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item asChild>
                        <NextLink href={`/edit/${encodeURIComponent(link.name)}`}>Edit</NextLink>
                      </DropdownMenu.Item>
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item color="red" onSelect={() => setPendingDelete(link)}>
                        Delete
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}

      <AlertDialog.Root
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setPendingDelete(null);
        }}
      >
        <AlertDialog.Content maxWidth="420px">
          <AlertDialog.Title>Delete go/{pendingDelete?.name}?</AlertDialog.Title>
          <AlertDialog.Description size="2">
            The shortcut will stop working. A teammate can create this name again later.
          </AlertDialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <Button
              variant="soft"
              color="gray"
              disabled={deleting}
              onClick={() => setPendingDelete(null)}
            >
              Cancel
            </Button>
            <Button color="red" onClick={confirmDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Flex>
  );
}
