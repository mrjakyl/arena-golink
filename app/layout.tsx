import "@radix-ui/themes/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Providers } from "@/components/providers";
import { getTeamSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Arena Path",
  description: "Internal nicknames for URLs",
  robots: { index: false, follow: false },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getTeamSession();
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="shell">
            <Header signedIn={Boolean(session)} />
            <main>{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
