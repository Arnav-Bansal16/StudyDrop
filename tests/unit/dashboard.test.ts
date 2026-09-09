import { describe, expect, it } from "vitest";

import { getDashboardSessions, normalizeDashboardView } from "@/lib/dashboard";
import type { StudySession } from "@/lib/types/session";

const now = new Date("2026-01-15T18:00:00.000Z");
const base: StudySession = {
  id: "session",
  hostId: "user:host",
  hostDisplayName: "Demo Host",
  courseLabel: "CSC 101",
  courseTitle: "Computer Science",
  topic: "Review",
  purpose: "homework",
  collaborationStyle: "collaborative",
  meetingMode: "online",
  locationLabel: "Demo room",
  meetingInstructions: null,
  organizerNotes: null,
  startsAt: "2026-01-15T19:00:00.000Z",
  endsAt: "2026-01-15T20:00:00.000Z",
  capacity: 4,
  participantCount: 0,
  visibility: "public",
  shareToken: "private-token",
  cancelledAt: null,
};

function session(overrides: Partial<StudySession>): StudySession {
  return {
    ...base,
    ...overrides,
    id: overrides.id ?? `session-${Math.random()}`,
  };
}

describe("dashboard grouping", () => {
  it("normalizes unknown views to hosted", () => {
    expect(normalizeDashboardView(undefined)).toBe("hosted");
    expect(normalizeDashboardView("unknown")).toBe("hosted");
    expect(normalizeDashboardView("past")).toBe("past");
  });

  it("separates hosted, joined, and past sessions using lifecycle status", () => {
    const hostedActive = session({ id: "hosted-active" });
    const joinedActive = session({
      id: "joined-active",
      hostId: "user:other",
      startsAt: "2026-01-15T17:30:00.000Z",
      endsAt: "2026-01-15T18:30:00.000Z",
    });
    const ended = session({
      id: "ended",
      startsAt: "2026-01-15T16:00:00.000Z",
      endsAt: "2026-01-15T17:00:00.000Z",
    });
    const cancelled = session({
      id: "cancelled",
      cancelledAt: "2026-01-15T17:00:00.000Z",
    });
    const sessions = [ended, hostedActive, cancelled, joinedActive];
    const joined = new Set(["joined-active", "cancelled"]);

    expect(
      getDashboardSessions({
        sessions,
        actorId: "user:host",
        joinedSessionIds: joined,
        view: "hosted",
        now,
      }).map(({ id }) => id),
    ).toEqual(["hosted-active"]);
    expect(
      getDashboardSessions({
        sessions,
        actorId: "user:host",
        joinedSessionIds: joined,
        view: "joined",
        now,
      }).map(({ id }) => id),
    ).toEqual(["joined-active"]);
    expect(
      getDashboardSessions({
        sessions,
        actorId: "user:host",
        joinedSessionIds: joined,
        view: "past",
        now,
      }).map(({ id }) => id),
    ).toEqual(["ended", "cancelled"]);
  });
});
