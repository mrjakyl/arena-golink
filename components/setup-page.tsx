"use client";

import { Box, Code, Flex, Heading, Link as RadixLink, Separator, Text } from "@radix-ui/themes";
import NextLink from "next/link";
import { useEffect, useState } from "react";
import { CopyButton } from "./copy-button";

export function SetupPage() {
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const template = origin ? `${origin}/%s` : "https://YOUR-HOST/%s";

  return (
    <Flex direction="column" gap="5" style={{ maxWidth: 640 }}>
      <div>
        <Heading size="7">Add the browser shortcut</Heading>
        <Text as="p" color="gray" mt="2">
          This is how Go Links is meant to be used. One custom search engine, about 30 seconds,
          once per browser profile. Safari is not supported in this prototype.
        </Text>
      </div>

      <Box p="4" style={{ background: "var(--teal-2)", borderRadius: 12 }}>
        <Text size="2" weight="medium">
          Search-engine URL template
        </Text>
        <Flex align="center" gap="3" mt="2" wrap="wrap">
          <Code size="3" style={{ flex: "1 1 240px" }}>
            {template}
          </Code>
          <CopyButton text={origin ? template : ""} />
        </Flex>
        <Text as="p" size="2" color="gray" mt="2">
          After setup: type <Code>go</Code>, press Tab, type an alias like <Code>wiki</Code>, press
          Enter. You can also open the alias as a path, e.g. <Code>/day-1-runbook</Code>.
        </Text>
      </Box>

      <section>
        <Heading size="4" mb="2">
          Chrome / Edge
        </Heading>
        <Text as="p" size="3">
          Settings → Search engine → Manage search engines and site search → Add
        </Text>
        <Box asChild mt="3">
          <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
            <li>
              <Text size="3">
                Name: <Code>Go Links</Code>
              </Text>
            </li>
            <li>
              <Text size="3">
                Shortcut: <Code>go</Code>
              </Text>
            </li>
            <li>
              <Text size="3">
                URL: <Code>{template}</Code>
              </Text>
            </li>
          </ul>
        </Box>
        <Text as="p" size="3" mt="3">
          Then type <Code>go</Code>, Tab, alias, Enter.
        </Text>
      </section>

      <Separator size="4" />

      <section>
        <Heading size="4" mb="2">
          Firefox
        </Heading>
        <Text as="p" size="3">
          Bookmark <Code>{template}</Code> and set the keyword to <Code>go</Code>.
        </Text>
        <Text as="p" size="3" mt="2">
          In the address bar, type <Code>go</Code>, space, alias, Enter.
        </Text>
      </section>

      <Separator size="4" />

      <section>
        <Heading size="4" mb="2">
          Safari
        </Heading>
        <Text as="p" size="3" color="gray">
          Not supported in v1 — Safari has no comparable keyword search. Use Chrome, Edge, or
          Firefox, or open links from this directory.
        </Text>
      </section>

      <Text size="2" color="gray">
        Anyone who can open this site can add or edit links. Treat it like a shared wiki.{" "}
        <RadixLink asChild>
          <NextLink href="/">Back to the directory</NextLink>
        </RadixLink>
      </Text>
    </Flex>
  );
}
