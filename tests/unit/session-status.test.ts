import { describe, expect, it } from "vitest";

import {
  canJoinSession,
  canLeaveSession,
  getOccupancy,
  getSessionDisplayStatus,
  isSessionFull,
} from "@/lib/session-status";
import type { StudySession } from "@/lib/types/session";

const REFERENCE_TIME = new Date("2026-01-15T18:00:00.000Z");
const HOST_ID = "host-1";
const OTHER_USER_ID = "user-2";

function iso(minutesFromReference: number): string {
  return new Date(
    REFERENCE_TIME.getTime() + minutesFromReference * 60 * 1000,
  ).toISOString();
}

function makeSession(overrides: Partial<StudySession> = {}): StudySession {
  return {
    id: "session-1",
    hostId: HOST_ID,
    hostDisplayName: "Test Host",
    courseLabel: "CSC 357",
    courseTitle: "Systems Programming",
    topic: "Test session",
    purpose: "homework",
    collaborationStyle: "collaborative",
    meetingMode: "in_person",
    locationLabel: "Kennedy Library",
    meetingInstructions: null,
    organizerNotes: null,
    startsAt: iso(60),
    endsAt: iso(120),
    capacity: 4,
    participantCount: 1,
    visibility: "public",
    shareToken: "00000000-0000-4000-8000-000000000001",
    cancelledAt: null,
    ...overrides,
  };
}

describe("getOccupancy", () => {
  it("counts the organizer plus participant rows", () => {
    expect(getOccupancy(makeSession({ participantCount: 0 }))).toBe(1);
    expect(getOccupancy(makeSession({ participantCount: 3 }))).toBe(4);
  });
});

describe("isSessionFull", () => {
  it("is not full one seat below capacity", () => {
    const session = makeSession({ capacity: 4, participantCount: 2 }); // occupancy 3
    expect(isSessionFull(session)).toBe(false);
  });

  it("is full when occupancy exactly equals capacity", () => {
    const session = makeSession({ capacity: 4, participantCount: 3 }); // occupancy 4
    expect(isSessionFull(session)).toBe(true);
  });

  it("is full when occupancy exceeds capacity", () => {
    const session = makeSession({ capacity: 4, participantCount: 10 });
    expect(isSessionFull(session)).toBe(true);
  });
});

describe("getSessionDisplayStatus", () => {
  it.each([
    [
      "cancelled overrides every other state",
      makeSession({
        cancelledAt: iso(-10),
        startsAt: iso(-120),
        endsAt: iso(-60), // would otherwise be "ended"
      }),
      "cancelled",
    ],
    [
      "ended at now >= endsAt",
      makeSession({ startsAt: iso(-120), endsAt: iso(-1) }),
      "ended",
    ],
    [
      "ended exactly at endsAt (boundary)",
      makeSession({ startsAt: iso(-120), endsAt: iso(0) }),
      "ended",
    ],
    [
      "in progress when startsAt <= now < endsAt",
      makeSession({ startsAt: iso(-30), endsAt: iso(30) }),
      "in_progress",
    ],
    [
      "in progress exactly at startsAt (boundary)",
      makeSession({ startsAt: iso(0), endsAt: iso(60) }),
      "in_progress",
    ],
    [
      "full for a future, at-capacity session",
      makeSession({
        startsAt: iso(120),
        endsAt: iso(180),
        capacity: 4,
        participantCount: 3,
      }),
      "full",
    ],
    [
      "starting soon exactly 60 minutes before start (boundary)",
      makeSession({
        startsAt: iso(60),
        endsAt: iso(120),
        capacity: 10,
        participantCount: 0,
      }),
      "starting_soon",
    ],
    [
      "upcoming immediately outside the starting-soon boundary",
      makeSession({
        startsAt: iso(61),
        endsAt: iso(121),
        capacity: 10,
        participantCount: 0,
      }),
      "upcoming",
    ],
    [
      "upcoming for a future session with room and outside the window",
      makeSession({
        startsAt: iso(24 * 60),
        endsAt: iso(24 * 60 + 60),
        capacity: 10,
        participantCount: 0,
      }),
      "upcoming",
    ],
  ] as const)("%s", (_label, session, expected) => {
    expect(getSessionDisplayStatus(session, REFERENCE_TIME)).toBe(expected);
  });

  it("prioritizes ended over full for a past, at-capacity session", () => {
    const session = makeSession({
      startsAt: iso(-120),
      endsAt: iso(-1),
      capacity: 4,
      participantCount: 3,
    });
    expect(getSessionDisplayStatus(session, REFERENCE_TIME)).toBe("ended");
  });

  it("prioritizes in_progress over full for a currently running, at-capacity session", () => {
    const session = makeSession({
      startsAt: iso(-30),
      endsAt: iso(30),
      capacity: 4,
      participantCount: 3,
    });
    expect(getSessionDisplayStatus(session, REFERENCE_TIME)).toBe(
      "in_progress",
    );
  });

  it("prioritizes full over starting_soon for a nearly-starting, at-capacity session", () => {
    const session = makeSession({
      startsAt: iso(10),
      endsAt: iso(70),
      capacity: 4,
      participantCount: 3,
    });
    expect(getSessionDisplayStatus(session, REFERENCE_TIME)).toBe("full");
  });
});

describe("join/leave eligibility", () => {
  it("remains eligible exactly at startsAt", () => {
    const session = makeSession({ startsAt: iso(0), endsAt: iso(60) });
    expect(canJoinSession(session, OTHER_USER_ID, REFERENCE_TIME)).toEqual({
      eligible: true,
    });
    expect(canLeaveSession(session, OTHER_USER_ID, REFERENCE_TIME)).toEqual({
      eligible: true,
    });
  });

  it("remains eligible immediately before the 15-minute grace cutoff", () => {
    const session = makeSession({ startsAt: iso(-15), endsAt: iso(60) });
    const justBeforeCutoff = new Date(REFERENCE_TIME.getTime() - 1);
    expect(
      canJoinSession(session, OTHER_USER_ID, justBeforeCutoff).eligible,
    ).toBe(true);
    expect(
      canLeaveSession(session, OTHER_USER_ID, justBeforeCutoff).eligible,
    ).toBe(true);
  });

  it("closes exactly at the 15-minute grace cutoff", () => {
    const session = makeSession({ startsAt: iso(-15), endsAt: iso(60) });
    // referenceTime is exactly startsAt + 15 minutes here
    expect(canJoinSession(session, OTHER_USER_ID, REFERENCE_TIME)).toEqual({
      eligible: false,
      reason: "closed",
    });
    expect(canLeaveSession(session, OTHER_USER_ID, REFERENCE_TIME)).toEqual({
      eligible: false,
      reason: "closed",
    });
  });

  it("closes at endsAt when the session ends before the 15-minute grace period", () => {
    // starts 10 minutes ago, ends now (10-minute session) — cutoff is endsAt, not startsAt+15
    const session = makeSession({ startsAt: iso(-10), endsAt: iso(0) });
    expect(canJoinSession(session, OTHER_USER_ID, REFERENCE_TIME)).toEqual({
      eligible: false,
      reason: "closed",
    });
    expect(canLeaveSession(session, OTHER_USER_ID, REFERENCE_TIME)).toEqual({
      eligible: false,
      reason: "closed",
    });

    const oneMinuteBeforeEnd = new Date(REFERENCE_TIME.getTime() - 1);
    expect(
      canJoinSession(session, OTHER_USER_ID, oneMinuteBeforeEnd).eligible,
    ).toBe(true);
  });

  it("rejects join/leave on a cancelled session even within the eligible window", () => {
    const session = makeSession({
      startsAt: iso(0),
      endsAt: iso(60),
      cancelledAt: iso(-5),
    });
    expect(canJoinSession(session, OTHER_USER_ID, REFERENCE_TIME)).toEqual({
      eligible: false,
      reason: "cancelled",
    });
    expect(canLeaveSession(session, OTHER_USER_ID, REFERENCE_TIME)).toEqual({
      eligible: false,
      reason: "cancelled",
    });
  });

  it("rejects a host joining their own session", () => {
    const session = makeSession({ startsAt: iso(60), endsAt: iso(120) });
    expect(canJoinSession(session, HOST_ID, REFERENCE_TIME)).toEqual({
      eligible: false,
      reason: "host",
    });
  });

  it("rejects a host leaving their own session", () => {
    const session = makeSession({ startsAt: iso(0), endsAt: iso(60) });
    expect(canLeaveSession(session, HOST_ID, REFERENCE_TIME)).toEqual({
      eligible: false,
      reason: "host",
    });
  });

  it("rejects joining a full session", () => {
    const session = makeSession({
      startsAt: iso(60),
      endsAt: iso(120),
      capacity: 4,
      participantCount: 3,
    });
    expect(canJoinSession(session, OTHER_USER_ID, REFERENCE_TIME)).toEqual({
      eligible: false,
      reason: "full",
    });
  });
});
