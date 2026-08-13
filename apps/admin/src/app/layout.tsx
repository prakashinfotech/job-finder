import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobFinder Admin",
  description: "Scaffolded admin dashboard for moderation and operations.",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
