import { SetupPage } from "@/components/setup-page";
import { requireTeamPage } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Setup() {
  await requireTeamPage("/setup");
  return <SetupPage origin={new URL(process.env.NEXTAUTH_URL!).origin} />;
}
