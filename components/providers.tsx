"use client";

import { Theme } from "@radix-ui/themes";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Theme
      appearance="light"
      accentColor="gray"
      grayColor="sand"
      radius="small"
      scaling="100%"
    >
      {children}
    </Theme>
  );
}
