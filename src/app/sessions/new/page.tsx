import type { Metadata } from "next";

import { CreateSessionForm } from "@/components/sessions/create-session-form";
import { requireAuthenticatedUser } from "@/lib/auth";
import { demoCourses } from "@/lib/data/demo-courses";

export const metadata: Metadata = { title: "Create a session" };

export default async function NewSessionPage() {
  await requireAuthenticatedUser("/sessions/new");

  return (
    <main className="page-container py-10 sm:py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-3">
          <p className="text-primary font-mono text-[0.68rem] font-semibold tracking-[0.18em] uppercase">Demo session builder</p>
          <h1 className="text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">Create a study session</h1>
          <p className="text-muted-foreground max-w-2xl leading-7">
            This demo uses process-local mock data. New sessions and participation may reset after a server restart or deployment instance change.
          </p>
        </div>
        <CreateSessionForm courses={demoCourses} />
      </div>
    </main>
  );
}
