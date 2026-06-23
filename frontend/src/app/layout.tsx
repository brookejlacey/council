import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "COUNCIL: Your Personal Board of AI Advisors",
  description:
    "Every person deserves a board of advisors. COUNCIL gives you 8 specialized AI experts who deliberate, debate, and deliver actionable guidance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0A0A0F] antialiased">{children}</body>
    </html>
  );
}
