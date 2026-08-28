"use client";

import { Theme } from "@radix-ui/themes";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Theme
      appearance="light"
      accentColor="teal"
      grayColor="sage"
      radius="medium"
      scaling="100%"
    >
      {children}
    </Theme>
  );
}
