import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppChromeWithAuth } from "@/components/AppChromeWithAuth";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Energybits Content Dashboard",
  description: "Next.js 14 dashboard backed by Airtable."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-background font-sans">
        <AppChromeWithAuth>{children}</AppChromeWithAuth>
      </body>
    </html>
  );
}
