import type { Metadata } from "next";
import { AppChrome } from "@/components/AppChrome";
import "./globals.css";

export const metadata: Metadata = {
  title: "Energybits Content Dashboard",
  description: "Next.js 14 dashboard backed by Airtable."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-slate-100 font-sans">
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
