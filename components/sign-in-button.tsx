"use client";

import { Button, Text } from "@radix-ui/themes";
import { signIn } from "next-auth/react";
import { useState } from "react";

export function SignInButton({ callbackUrl }: { callbackUrl: string }) {
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  async function login() {
    setPending(true);
    setFailed(false);
    try { await signIn("google", { callbackUrl }); }
    catch { setFailed(true); setPending(false); }
  }
  return <>
    <Button size="3" highContrast disabled={pending} onClick={login}>
      {pending ? "Opening Google…" : "Continue with Google"}
    </Button>
    {failed ? <Text color="red" role="alert">Couldn’t open sign-in. Please try again.</Text> : null}
  </>;
}
