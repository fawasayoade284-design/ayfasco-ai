import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ayfasco AI",
  description: "Ayfasco AI — general assistant with strong coding intelligence.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
