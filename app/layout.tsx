import type { Metadata } from "next";
import { AppChromeWithAuth } from "@/components/AppChromeWithAuth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Energybits Content Dashboard",
  description: "Next.js 14 dashboard backed by Airtable."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-background font-sans">
        <AppChromeWithAuth>{children}</AppChromeWithAuth>
      </body>
    </html>
  );
}
