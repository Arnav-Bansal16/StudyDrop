import type { Metadata } from "next";

import { RouteShell } from "@/components/site/route-shell";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <RouteShell
      eyebrow="Account shell"
      title="Log in to StudyDrop"
      description="Secure Cal Poly account access will be connected in the authentication phase. No login form is active yet."
    />
  );
}
