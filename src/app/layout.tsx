import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "شركة الرائد لتأجير السيارات | ALRAID Car Rental", template: "%s | ALRAID" },
  description: "شركة الرائد لتأجير السيارات في كركوك — ALRAID Car Rental",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}