import type { Metadata } from "next";

import { RouteShell } from "@/components/site/route-shell";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <RouteShell
      eyebrow="Dashboard shell"
      title="Your StudyDrop dashboard"
      description="Hosted, joined, and past sessions will appear here once accounts and session data are connected."
    />
  );
}
