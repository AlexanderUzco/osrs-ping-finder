import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OSRS Ping Finder",
  description:
    "Find the Old School RuneScape world with the lowest ping for your location. Filters by country, members/F2P, and activity.",
  keywords: ["OSRS", "Old School RuneScape", "ping", "latency", "world", "best world"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
