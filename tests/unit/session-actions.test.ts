import { describe, expect, it, beforeEach } from "vitest";

import {
  cancelMockSession,
  createMockSession,
  findMockSessionById,
  isMockParticipant,
  joinMockSession,
  leaveMockSession,
  resetMockSessionStore,
} from "@/lib/data/mock-session-store";
import { validateCreateSessionInput } from "@/lib/validation/session";

const NOW = new Date("2026-01-15T18:00:00.000Z");
const validInput = {
  courseLabel: "CSC 101",
  topic: "Review recursion practice",
  purpose: "homework",
  collaborationStyle: "collaborative",
  meetingMode: "online",
  locationLabel: "Demo Zoom room",
  startsAt: "2026-01-15T19:00:00.000Z",
  endsAt: "2026-01-15T20:00:00.000Z",
  capacity: "2",
  visibility: "public",
  meetingInstructions: "",
  organizerNotes: "",
};

describe("demo session mutations", () => {
  beforeEach(() => resetMockSessionStore(NOW));

  it("validates required fields and the time window", () => {
    expect(
      validateCreateSessionInput({ ...validInput, courseLabel: "BAD" }, NOW)
        .success,
    ).toBe(false);
    expect(
      validateCreateSessionInput(
        { ...validInput, endsAt: "2026-01-15T19:20:00.000Z" },
        NOW,
      ).success,
    ).toBe(false);
    expect(validateCreateSessionInput(validInput, NOW).success).toBe(true);
  });

  it("counts the host exactly once and enforces exact capacity", () => {
    const parsed = validateCreateSessionInput(validInput, NOW);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    const session = createMockSession({
      ...parsed.data,
      hostId: "user:a",
      hostDisplayName: "A",
    });
    expect(session.participantCount).toBe(0);
    expect(joinMockSession(session.id, "user:b", NOW).ok).toBe(true);
    expect(joinMockSession(session.id, "user:c", NOW).ok).toBe(false);
    expect(joinMockSession(session.id, "user:a", NOW).ok).toBe(false);
    expect(findMockSessionById(session.id)?.participantCount).toBe(1);
  });

  it("updates join and leave state without duplicate participants", () => {
    const parsed = validateCreateSessionInput(validInput, NOW);
    if (!parsed.success) throw new Error("fixture should be valid");
    const session = createMockSession({
      ...parsed.data,
      hostId: "user:a",
      hostDisplayName: "A",
    });
    expect(joinMockSession(session.id, "user:b", NOW).ok).toBe(true);
    expect(joinMockSession(session.id, "user:b", NOW).ok).toBe(false);
    expect(isMockParticipant(session.id, "user:b")).toBe(true);
    expect(leaveMockSession(session.id, "user:b", NOW).ok).toBe(true);
    expect(isMockParticipant(session.id, "user:b")).toBe(false);
    expect(findMockSessionById(session.id)?.participantCount).toBe(0);
  });

  it("restricts cancellation to the host and keeps cancelled details addressable", () => {
    const parsed = validateCreateSessionInput(validInput, NOW);
    if (!parsed.success) throw new Error("fixture should be valid");
    const session = createMockSession({
      ...parsed.data,
      hostId: "user:a",
      hostDisplayName: "A",
    });
    expect(cancelMockSession(session.id, "user:b", NOW).ok).toBe(false);
    expect(cancelMockSession(session.id, "user:a", NOW).ok).toBe(true);
    expect(findMockSessionById(session.id)?.cancelledAt).toBe(
      NOW.toISOString(),
    );
    expect(joinMockSession(session.id, "user:b", NOW).ok).toBe(false);
  });

  it("does not allow cancellation after a session has ended", () => {
    const parsed = validateCreateSessionInput(
      {
        ...validInput,
        startsAt: "2026-01-15T16:00:00.000Z",
        endsAt: "2026-01-15T17:00:00.000Z",
      },
      new Date("2026-01-15T15:00:00.000Z"),
    );
    if (!parsed.success) throw new Error("fixture should be valid");
    const session = createMockSession({
      ...parsed.data,
      hostId: "user:a",
      hostDisplayName: "A",
    });

    expect(cancelMockSession(session.id, "user:a", NOW)).toEqual({
      ok: false,
      message: "Ended sessions cannot be cancelled.",
    });
  });
});
