import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";
import { signUpAction } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <AuthForm
      mode="signup"
      title="Create your StudyDrop account"
      description="Use a calpoly.edu email to try the demo dashboard and protected routes."
      action={signUpAction}
      next="/dashboard"
    />
  );
}
