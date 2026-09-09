import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";
import { signInAction } from "@/lib/auth";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const next = (await searchParams)?.next ?? "/dashboard";

  return (
    <AuthForm
      mode="login"
      title="Log in to StudyDrop"
      description="Use any calpoly.edu email and demo password to access the protected demo routes."
      action={signInAction}
      next={next}
    />
  );
}
