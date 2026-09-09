"use client";

import { useEffect } from "react";

import { buttonVariants } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="page-container py-16">
      <div className="mx-auto max-w-xl rounded-3xl border border-dashed p-8 text-center">
        <h1 className="text-2xl font-semibold">Dashboard unavailable</h1>
        <p className="text-muted-foreground mt-3">
          We could not load your demo sessions. Try again without losing your
          current sign-in.
        </p>
        <button
          type="button"
          onClick={reset}
          className={`${buttonVariants()} mt-6`}
        >
          Try again
        </button>
      </div>
    </main>
  );
}
