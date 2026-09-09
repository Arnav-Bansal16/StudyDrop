import type { Metadata } from "next";

import { signOutAction } from "@/lib/auth";
import { requireAuthenticatedUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireAuthenticatedUser("/dashboard");

  return (
    <main className="page-container py-12 sm:py-20">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-primary font-mono text-xs font-semibold tracking-[0.18em] uppercase">
          Dashboard
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
          Welcome back
        </h1>
        <p className="text-muted-foreground mt-4 text-base leading-7">
          You are signed in as{" "}
          <span className="font-medium text-slate-800">{user.email}</span>.
        </p>
        <p className="text-muted-foreground mt-2 text-base leading-7">
          Hosted, joined, and past sessions will appear here once the session features are added in the next prompt.
        </p>
        <form action={signOutAction} className="mt-8">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Log out
          </button>
        </form>
      </div>
    </main>
  );
}
