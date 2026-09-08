import type { Metadata, Viewport } from "next";
import { GeistMono, GeistSans } from "geist/font";

import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "StudyDrop — Study sessions happening soon",
    template: "%s — StudyDrop",
  },
  description:
    "Create and discover small, course-specific study sessions happening soon with other Cal Poly students.",
  applicationName: "StudyDrop",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8f8f2",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="flex min-h-svh flex-col antialiased">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
