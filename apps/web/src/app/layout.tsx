import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Search Jobs Online | Hire Candidates | Post a Job | jobfinder.co",
  description:
    "Replica landing page inspired by jobfinder.co with job discovery, hiring CTAs, and mobile-first career sections.",
  icons: {
    icon: "/favicon.svg",
  },
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
