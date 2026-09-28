import { redirect } from "next/navigation";

export const dynamic = "force-static";

// The 8-BIT NBA arcade game lives in public/game/index.html.
// A static route segment wins over the dynamic /[name] golink redirect,
// so /game serves the game instead of treating "game" as a link name.
export function GET() {
  redirect("/game/index.html");
}
