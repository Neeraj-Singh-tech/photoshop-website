import type { Metadata } from "next";
import "./globals.css";
import FloatingCTA from "@/components/FloatingCTA";

export const metadata: Metadata = {
  title: "Pravin Photo Studio",
  description: "Pravin Photo Studio — Capturing Moments, Creating Memories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <FloatingCTA />
      </body>
    </html>
  );
}