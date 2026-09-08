import type { Metadata } from "next";

import { RouteShell } from "@/components/site/route-shell";

export const metadata: Metadata = { title: "Browse sessions" };

export default function SessionsPage() {
  return (
    <RouteShell
      eyebrow="Browse shell"
      title="Upcoming study sessions"
      description="Course search, filters, and real session listings are intentionally not active in this foundation phase."
    />
  );
}
