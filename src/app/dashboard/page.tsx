import type { Metadata } from "next";
import Link from "next/link";

import { SessionActions } from "@/components/sessions/session-actions";
import { buttonVariants } from "@/components/ui/button";
import { requireAuthenticatedUser, signOutAction } from "@/lib/auth";
import { getDemoUserId } from "@/lib/demo-user";
import { isMockParticipant, listMockSessions } from "@/lib/data/mock-session-store";
import { canLeaveSession, getSessionDisplayStatus, getOccupancy } from "@/lib/session-status";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ view?: string }>;
}) {
  const user = await requireAuthenticatedUser("/dashboard");
  const actorId = getDemoUserId(user);
  const view = (await searchParams)?.view ?? "hosted";
  const now = new Date();
  const sessions = listMockSessions()
    .filter((session) => {
      const hosted = session.hostId === actorId;
      const joined = isMockParticipant(session.id, actorId);
      const status = getSessionDisplayStatus(session, now);
      if (view === "joined") return joined && !hosted && status !== "ended" && status !== "cancelled";
      if (view === "past") return (hosted || joined) && (status === "ended" || status === "cancelled");
      return hosted && status !== "ended" && status !== "cancelled";
    })
    .sort((left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime());

  return (
    <main className="page-container py-10 sm:py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
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
          </div>
          <Link href="/sessions/new" className={buttonVariants()}>Create a session</Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["hosted", "joined", "past"] as const).map((tab) => (
            <Link key={tab} href={`/dashboard?view=${tab}`} className={buttonVariants({ variant: view === tab ? "default" : "outline", size: "sm" })}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Link>
          ))}
        </div>
        {sessions.length === 0 ? (
          <div className="border-border bg-card rounded-3xl border border-dashed p-10 text-center">
            <h2 className="text-xl font-semibold">No {view} sessions yet</h2>
            <p className="text-muted-foreground mt-2">Create a session or browse the upcoming study groups.</p>
            <Link href={view === "hosted" ? "/sessions/new" : "/sessions"} className={`${buttonVariants({ variant: "outline" })} mt-5`}>
              {view === "hosted" ? "Create a session" : "Browse sessions"}
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {sessions.map((session) => {
              const status = getSessionDisplayStatus(session, now);
              const joined = isMockParticipant(session.id, actorId);
              return (
                <div key={session.id} className="border-border bg-card flex flex-col gap-5 rounded-3xl border p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-primary font-mono text-xs font-semibold tracking-[0.14em] uppercase">{session.courseLabel}</p>
                    <h2 className="mt-2 text-xl font-semibold">{session.topic}</h2>
                    <p className="text-muted-foreground mt-2 text-sm">{getSessionDisplayStatus(session, now).replace("_", " ")} · {getOccupancy(session)} of {session.capacity} seats</p>
                    <Link href={session.visibility === "unlisted" ? `/s/${session.shareToken}` : `/sessions/${session.id}`} className="text-primary mt-2 inline-block text-sm font-medium underline-offset-4 hover:underline">View details</Link>
                  </div>
                  <div className="w-full sm:w-52">
                    <SessionActions
                      sessionId={session.id}
                      returnPath="/dashboard"
                      canJoin={false}
                      canLeave={joined && canLeaveSession(session, actorId, now).eligible}
                      canCancel={session.hostId === actorId && status !== "ended" && status !== "cancelled"}
                      joined={joined}
                      disabledReason={status === "cancelled" ? "Cancelled sessions remain visible for reference." : undefined}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <form action={signOutAction}>
          <button type="submit" className={buttonVariants({ variant: "outline" })}>Log out</button>
        </form>
      </div>
    </main>
  );
}
