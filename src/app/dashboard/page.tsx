import type { Metadata } from "next";
import Link from "next/link";

import { SessionActions } from "@/components/sessions/session-actions";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { requireAuthenticatedUser, signOutAction } from "@/lib/auth";
import { getDemoUserId } from "@/lib/demo-user";
import {
  isMockParticipant,
  listMockSessions,
} from "@/lib/data/mock-session-store";
import {
  dashboardPath,
  getDashboardSessions,
  normalizeDashboardView,
  type DashboardView,
} from "@/lib/dashboard";
import {
  canLeaveSession,
  getOccupancy,
  getSessionDisplayStatus,
} from "@/lib/session-status";

export const metadata: Metadata = { title: "Dashboard" };

function formatLabel(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatSessionWindow(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const date = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(start);
  const time = `${start.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })}–${end.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })}`;
  return `${date} · ${time}`;
}

function statusLabel(status: string): string {
  return formatLabel(status === "in_progress" ? "in progress" : status);
}

const viewCopy: Record<
  DashboardView,
  {
    title: string;
    description: string;
    emptyTitle: string;
    emptyBody: string;
    action: string;
    actionHref: string;
  }
> = {
  hosted: {
    title: "Hosted sessions",
    description: "Sessions you organized that are upcoming or in progress.",
    emptyTitle: "You are not hosting a session yet",
    emptyBody:
      "Create a focused study time and share the link with your classmates.",
    action: "Create a session",
    actionHref: "/sessions/new",
  },
  joined: {
    title: "Joined sessions",
    description:
      "Sessions where you are participating, including unlisted links you joined.",
    emptyTitle: "No active joined sessions",
    emptyBody:
      "Browse upcoming public sessions and join one that fits your schedule.",
    action: "Browse sessions",
    actionHref: "/sessions",
  },
  past: {
    title: "Past sessions",
    description:
      "Ended and cancelled sessions associated with your demo account.",
    emptyTitle: "No session history yet",
    emptyBody:
      "Your ended or cancelled hosted and joined sessions will appear here.",
    action: "Browse sessions",
    actionHref: "/sessions",
  },
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ view?: string }>;
}) {
  const rawView = (await searchParams)?.view;
  const view = normalizeDashboardView(rawView);
  const user = await requireAuthenticatedUser(
    rawView === undefined ? "/dashboard" : dashboardPath(view),
  );
  const actorId = getDemoUserId(user);
  const now = new Date();
  const allSessions = listMockSessions(now);
  const joinedSessionIds = new Set(
    allSessions
      .filter((session) => isMockParticipant(session.id, actorId))
      .map((session) => session.id),
  );
  const sessions = getDashboardSessions({
    sessions: allSessions,
    actorId,
    joinedSessionIds,
    view,
    now,
  });
  const copy = viewCopy[view];

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
          <Link href="/sessions/new" className={buttonVariants()}>
            Create a session
          </Link>
        </div>

        <nav aria-label="Dashboard views" className="flex flex-wrap gap-2">
          {(["hosted", "joined", "past"] as const).map((tab) => (
            <Link
              key={tab}
              href={dashboardPath(tab)}
              aria-current={view === tab ? "page" : undefined}
              className={buttonVariants({
                variant: view === tab ? "default" : "outline",
                size: "sm",
              })}
            >
              {formatLabel(tab)}
            </Link>
          ))}
        </nav>

        <section aria-labelledby="dashboard-view-title" className="space-y-5">
          <div>
            <h2
              id="dashboard-view-title"
              className="text-2xl font-semibold tracking-[-0.04em]"
            >
              {copy.title}
            </h2>
            <p className="text-muted-foreground mt-2">{copy.description}</p>
          </div>

          {sessions.length === 0 ? (
            <div className="border-border bg-card rounded-3xl border border-dashed p-10 text-center">
              <h3 className="text-xl font-semibold">{copy.emptyTitle}</h3>
              <p className="text-muted-foreground mx-auto mt-2 max-w-md">
                {copy.emptyBody}
              </p>
              <Link
                href={copy.actionHref}
                className={`${buttonVariants({ variant: "outline" })} mt-5`}
              >
                {copy.action}
              </Link>
            </div>
          ) : (
            <div className="grid gap-4" aria-live="polite">
              {sessions.map((session) => {
                const status = getSessionDisplayStatus(session, now);
                const joined = isMockParticipant(session.id, actorId);
                const isHost = session.hostId === actorId;
                const detailsHref =
                  session.visibility === "unlisted"
                    ? `/s/${session.shareToken}`
                    : `/sessions/${session.id}`;
                const canCancel =
                  isHost && status !== "ended" && status !== "cancelled";

                return (
                  <article
                    key={session.id}
                    className="border-border bg-card flex flex-col gap-5 rounded-3xl border p-5 sm:p-6"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-primary font-mono text-xs font-semibold tracking-[0.14em] uppercase">
                            {session.courseLabel}
                          </p>
                          <Badge className="bg-secondary text-secondary-foreground">
                            {session.visibility === "public"
                              ? "Public"
                              : "Unlisted"}
                          </Badge>
                          <Badge aria-label={`Status: ${statusLabel(status)}`}>
                            {statusLabel(status)}
                          </Badge>
                        </div>
                        <h3 className="mt-2 text-xl font-semibold break-words">
                          {session.topic}
                        </h3>
                        <p className="text-muted-foreground mt-1 text-sm">
                          {session.courseTitle}
                        </p>
                      </div>
                      <p className="text-muted-foreground shrink-0 text-sm">
                        {isHost ? "Hosted by you" : "Joined by you"}
                      </p>
                    </div>

                    <dl className="grid gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-muted-foreground">When</dt>
                        <dd className="mt-1 font-medium">
                          {formatSessionWindow(
                            session.startsAt,
                            session.endsAt,
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">
                          Purpose and style
                        </dt>
                        <dd className="mt-1 font-medium">
                          {formatLabel(session.purpose)} ·{" "}
                          {formatLabel(session.collaborationStyle)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Meeting</dt>
                        <dd className="mt-1 font-medium">
                          {formatLabel(session.meetingMode)} ·{" "}
                          {session.locationLabel}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Occupancy</dt>
                        <dd className="mt-1 font-medium">
                          {getOccupancy(session)} of {session.capacity} seats
                          filled
                        </dd>
                      </div>
                    </dl>

                    <div className="flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-start sm:justify-between">
                      <Link
                        href={detailsHref}
                        className="text-primary inline-flex min-h-11 items-center text-sm font-medium underline-offset-4 hover:underline"
                      >
                        Open session details
                      </Link>
                      <div className="w-full sm:w-56">
                        <SessionActions
                          sessionId={session.id}
                          returnPath={dashboardPath(view)}
                          canJoin={false}
                          canLeave={
                            joined &&
                            canLeaveSession(session, actorId, now).eligible
                          }
                          canCancel={canCancel}
                          joined={joined}
                          disabledReason={
                            status === "cancelled"
                              ? "Cancelled sessions remain visible for reference."
                              : status === "ended"
                                ? "Ended sessions remain visible for reference."
                                : undefined
                          }
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <form action={signOutAction}>
          <button
            type="submit"
            className={buttonVariants({ variant: "outline" })}
          >
            Log out
          </button>
        </form>
      </div>
    </main>
  );
}
