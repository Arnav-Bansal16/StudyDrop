"use client";

import {
  AlertCircle,
  ArrowRight,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { AuthFormState } from "@/lib/validation/auth";

const initialState: AuthFormState = {};

type AuthFormProps = {
  mode: "login" | "signup";
  title: string;
  description: string;
  action: (
    prevState: AuthFormState | undefined,
    formData: FormData,
  ) => Promise<AuthFormState>;
  next?: string;
};

export function AuthForm({
  mode,
  title,
  description,
  action,
  next = "/dashboard",
}: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <main className="page-container flex min-h-[calc(100svh-4.5rem)] items-center justify-center py-10 sm:py-16">
      <Card className="w-full max-w-xl overflow-hidden">
        <CardHeader className="border-border bg-muted/45 border-b p-6 sm:p-8">
          <div className="flex items-center gap-2 text-sm font-medium tracking-[0.18em] text-emerald-700 uppercase">
            <ShieldCheck className="size-4" aria-hidden="true" />
            Cal Poly access
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
            {title}
          </h1>
          <p className="text-muted-foreground mt-3 text-base leading-7">
            {description}
          </p>
          <p className="mt-3 text-sm font-medium text-amber-700">
            Demo mode: no real account or email is created.
          </p>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          <form action={formAction} className="space-y-5">
            {mode === "signup" ? (
              <div className="space-y-2">
                <label htmlFor="displayName" className="text-sm font-medium">
                  Display name
                </label>
                <div className="relative">
                  <UserRound
                    className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
                    aria-hidden="true"
                  />
                  <input
                    id="displayName"
                    name="displayName"
                    type="text"
                    autoComplete="name"
                    placeholder="Jordan Lee"
                    className="border-border bg-background focus:ring-primary/60 h-11 w-full rounded-xl border pr-3 pl-10 text-sm outline-none focus:ring-2"
                  />
                </div>
                {state.fieldErrors?.displayName ? (
                  <p className="text-sm text-red-600">
                    {state.fieldErrors.displayName}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email address
              </label>
              <div className="relative">
                <Mail
                  className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
                  aria-hidden="true"
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="student@calpoly.edu"
                  className="border-border bg-background focus:ring-primary/60 h-11 w-full rounded-xl border pr-3 pl-10 text-sm outline-none focus:ring-2"
                />
              </div>
              {state.fieldErrors?.email ? (
                <p className="text-sm text-red-600">
                  {state.fieldErrors.email}
                </p>
              ) : null}
            </div>

            {mode === "signup" ? (
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Choose a secure password"
                  className="border-border bg-background focus:ring-primary/60 h-11 w-full rounded-xl border px-3 text-sm outline-none focus:ring-2"
                />
                {state.fieldErrors?.password ? (
                  <p id="password-error" className="text-sm text-red-600">
                    {state.fieldErrors.password}
                  </p>
                ) : null}

                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium"
                >
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  className="border-border bg-background focus:ring-primary/60 h-11 w-full rounded-xl border px-3 text-sm outline-none focus:ring-2"
                />
                {state.fieldErrors?.confirmPassword ? (
                  <p
                    id="confirm-password-error"
                    className="text-sm text-red-600"
                  >
                    {state.fieldErrors.confirmPassword}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="border-border bg-background focus:ring-primary/60 h-11 w-full rounded-xl border px-3 text-sm outline-none focus:ring-2"
                />
                {state.fieldErrors?.password ? (
                  <p className="text-sm text-red-600">
                    {state.fieldErrors.password}
                  </p>
                ) : null}
              </div>
            )}

            <input type="hidden" name="next" value={next} />

            {state.message ? (
              <div className="border-border bg-muted/50 flex items-start gap-3 rounded-xl border p-3 text-sm text-slate-700">
                <AlertCircle
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                <p>{state.message}</p>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isPending}
              className={buttonVariants({ size: "lg", className: "w-full" })}
            >
              {isPending
                ? "Please wait..."
                : mode === "login"
                  ? "Log in"
                  : "Create account"}
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between gap-3 text-sm text-slate-600">
            <span>
              {mode === "login"
                ? "Need an account?"
                : "Already have an account?"}
            </span>
            <Link
              href={mode === "login" ? "/signup" : "/login"}
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              {mode === "login" ? "Sign up" : "Log in"}
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
