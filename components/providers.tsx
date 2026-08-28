"use client";

import { Theme } from "@radix-ui/themes";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Theme
      appearance="light"
      accentColor="gray"
      grayColor="gray"
      radius="medium"
      scaling="100%"
    >
      {children}
    </Theme>
  );
}
