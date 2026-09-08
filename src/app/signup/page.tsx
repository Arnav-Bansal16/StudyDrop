import type { Metadata } from "next";

import { RouteShell } from "@/components/site/route-shell";

export const metadata: Metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <RouteShell
      eyebrow="Account shell"
      title="Join StudyDrop"
      description="Verified calpoly.edu registration will be enabled when the secure authentication foundation is ready."
    />
  );
}
