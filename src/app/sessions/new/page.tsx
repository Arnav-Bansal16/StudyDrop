import type { Metadata } from "next";

import { RouteShell } from "@/components/site/route-shell";

export const metadata: Metadata = { title: "Create a session" };

export default function NewSessionPage() {
  return (
    <RouteShell
      eyebrow="Create shell"
      title="Create a study session"
      description="Session creation will be enabled after authentication and secure data storage are in place."
    />
  );
}
