import "./globals.css";
import { SessionProvider } from "@/lib/session";
import type { ReactNode } from "react";

export const metadata = {
  title: "IMEI TRIANGULATOR — Investigative Intelligence (Demo)",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}