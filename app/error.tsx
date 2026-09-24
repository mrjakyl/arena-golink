"use client";

import { Button, Flex, Heading, Text } from "@radix-ui/themes";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <Flex direction="column" align="start" gap="4">
    <Heading size="6">We couldn’t load your links.</Heading>
    <Text color="gray">Please try again in a moment.</Text>
    <Button onClick={reset}>Try again</Button>
  </Flex>;
}
