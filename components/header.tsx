"use client";

import { Button, Flex, Heading, Link as RadixLink, Text } from "@radix-ui/themes";
import NextLink from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const onNew = pathname === "/new";

  return (
    <Flex align="center" justify="between" gap="4" mb="6" wrap="wrap">
      <Flex align="center" gap="3">
        <RadixLink asChild underline="none" highContrast>
          <NextLink href="/">
            <Flex align="center" gap="2">
              <span aria-hidden className="mark">
                <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
                  <path
                    d="M7 16h13M16 9l8 7-8 7"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <Heading size="5" as="h2">
                Arena Go
              </Heading>
            </Flex>
          </NextLink>
        </RadixLink>
        <Text size="2" color="gray">
          Shared nicknames
        </Text>
      </Flex>
      <Flex gap="2" align="center">
        <Button asChild variant="ghost" color="gray">
          <NextLink href="/setup">Setup</NextLink>
        </Button>
        <Button asChild variant={onNew ? "soft" : "solid"} highContrast={!onNew}>
          <NextLink href="/new">New link</NextLink>
        </Button>
      </Flex>
    </Flex>
  );
}
