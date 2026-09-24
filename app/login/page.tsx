import { Heading, Text, Flex } from "@radix-ui/themes";
import { redirect } from "next/navigation";
import { authConfigured, getTeamSession } from "@/lib/auth";
import { safeReturnPath } from "@/lib/access";
import { firstParam } from "@/lib/validation";
import { SignInButton } from "@/components/sign-in-button";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: {
  searchParams: Promise<{ callbackUrl?: string | string[]; error?: string | string[] }>;
}) {
  const params = await searchParams;
  const callbackUrl = safeReturnPath(firstParam(params.callbackUrl));
  if (await getTeamSession()) redirect(callbackUrl);
  const configured = authConfigured();
  return (
    <Flex direction="column" align="start" gap="4" style={{ maxWidth: 520 }}>
      <Heading size="7">Your team’s shortcuts, in one place.</Heading>
      <Text color="gray">Sign in with your team Google account to find, create, and update shared links.</Text>
      {params.error ? <Text color="red" role="alert">We couldn’t sign you in. Use an approved team account and try again.</Text> : null}
      {configured ? <SignInButton callbackUrl={callbackUrl} /> :
        <Text role="status">Sign-in isn’t available yet. Please contact the team managing Arena Path.</Text>}
    </Flex>
  );
}
