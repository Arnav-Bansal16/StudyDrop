import type { StudySession } from "@/lib/types/session";

/**
 * Pure, deterministic session-rules module.
 *
 * Every function here takes an explicit `referenceTime` instead of
 * reading the system clock, so callers (pages, Server Actions, and
 * later Postgres functions expressing the same predicates) can be
 * tested deterministically and stay in sync with a single source of
 * truth for the rules.
 */

export type SessionDisplayStatus =
  "cancelled" | "ended" | "in_progress" | "full" | "starting_soon" | "upcoming";

/** A session is "starting soon" beginning 60 minutes before `startsAt`. */
const STARTING_SOON_WINDOW_MS = 60 * 60 * 1000;

/** Join/leave stay open through a 15-minute grace period after start. */
const JOIN_LEAVE_GRACE_MS = 15 * 60 * 1000;

export interface SessionEligibility {
  eligible: boolean;
  reason?: "cancelled" | "host" | "full" | "closed";
}

/** Total occupancy always includes the organizer, who is never a participant row. */
export function getOccupancy(session: StudySession): number {
  return 1 + session.participantCount;
}

/** A session is full once total occupancy meets or exceeds capacity. */
export function isSessionFull(session: StudySession): boolean {
  return getOccupancy(session) >= session.capacity;
}

/**
 * Derives the single display status for a session at `referenceTime`,
 * following the documented priority order: cancelled, ended, in
 * progress, full, starting soon, upcoming.
 */
export function getSessionDisplayStatus(
  session: StudySession,
  referenceTime: Date,
): SessionDisplayStatus {
  if (session.cancelledAt !== null) {
    return "cancelled";
  }

  const now = referenceTime.getTime();
  const startsAt = new Date(session.startsAt).getTime();
  const endsAt = new Date(session.endsAt).getTime();

  if (now >= endsAt) {
    return "ended";
  }

  if (now >= startsAt) {
    return "in_progress";
  }

  if (isSessionFull(session)) {
    return "full";
  }

  if (startsAt - now <= STARTING_SOON_WINDOW_MS) {
    return "starting_soon";
  }

  return "upcoming";
}

/** The instant join/leave close: the earlier of `startsAt + 15m` or `endsAt`. */
function getJoinLeaveCutoff(session: StudySession): number {
  const startsAt = new Date(session.startsAt).getTime();
  const endsAt = new Date(session.endsAt).getTime();
  return Math.min(startsAt + JOIN_LEAVE_GRACE_MS, endsAt);
}

/** Join/leave remain eligible at `startsAt` and close strictly before the cutoff. */
function isWithinJoinLeaveWindow(
  session: StudySession,
  referenceTime: Date,
): boolean {
  return referenceTime.getTime() < getJoinLeaveCutoff(session);
}

/**
 * Join eligibility: not cancelled, not the host, below capacity, and
 * strictly before the earlier of `startsAt + 15m` or `endsAt`.
 */
export function canJoinSession(
  session: StudySession,
  actorId: string,
  referenceTime: Date,
): SessionEligibility {
  if (session.cancelledAt !== null) {
    return { eligible: false, reason: "cancelled" };
  }

  if (session.hostId === actorId) {
    return { eligible: false, reason: "host" };
  }

  if (isSessionFull(session)) {
    return { eligible: false, reason: "full" };
  }

  if (!isWithinJoinLeaveWindow(session, referenceTime)) {
    return { eligible: false, reason: "closed" };
  }

  return { eligible: true };
}

/**
 * Leave eligibility: not cancelled, not the host (hosts are never
 * participants), and strictly before the earlier of `startsAt + 15m`
 * or `endsAt`.
 */
export function canLeaveSession(
  session: StudySession,
  actorId: string,
  referenceTime: Date,
): SessionEligibility {
  if (session.cancelledAt !== null) {
    return { eligible: false, reason: "cancelled" };
  }

  if (session.hostId === actorId) {
    return { eligible: false, reason: "host" };
  }

  if (!isWithinJoinLeaveWindow(session, referenceTime)) {
    return { eligible: false, reason: "closed" };
  }

  return { eligible: true };
}
