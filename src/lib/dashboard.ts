import { getSessionDisplayStatus } from "@/lib/session-status";
import type { StudySession } from "@/lib/types/session";

export const dashboardViews = ["hosted", "joined", "past"] as const;
export type DashboardView = (typeof dashboardViews)[number];

export function normalizeDashboardView(
  value: string | undefined,
): DashboardView {
  return dashboardViews.includes(value as DashboardView)
    ? (value as DashboardView)
    : "hosted";
}

export function dashboardPath(view: DashboardView): string {
  return `/dashboard?view=${view}`;
}

export function getDashboardSessions({
  sessions,
  actorId,
  joinedSessionIds,
  view,
  now,
}: {
  sessions: StudySession[];
  actorId: string;
  joinedSessionIds: ReadonlySet<string>;
  view: DashboardView;
  now: Date;
}): StudySession[] {
  return sessions
    .filter((session) => {
      const hosted = session.hostId === actorId;
      const joined = joinedSessionIds.has(session.id);
      const status = getSessionDisplayStatus(session, now);
      const active = status !== "ended" && status !== "cancelled";

      if (view === "joined") return joined && !hosted && active;
      if (view === "past") {
        return (
          (hosted || joined) && (status === "ended" || status === "cancelled")
        );
      }
      return hosted && active;
    })
    .sort(
      (left, right) =>
        new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime(),
    );
}
