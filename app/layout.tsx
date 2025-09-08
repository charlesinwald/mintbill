import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "invoices",
  description: "Converted to Next.js with API backend",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}


