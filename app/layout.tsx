import "@radix-ui/themes/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Go Links",
  description: "Internal nicknames for URLs",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="shell">
            <Header />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
