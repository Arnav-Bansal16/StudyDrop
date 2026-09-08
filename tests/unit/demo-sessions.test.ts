import { describe, expect, it } from "vitest";

import {
  buildDemoSessions,
  findPublicDemoSessionById,
  findUnlistedDemoSessionByShareToken,
  listDemoSessions,
} from "@/lib/data/demo-sessions";
import { getSessionDisplayStatus, isSessionFull } from "@/lib/session-status";

const REFERENCE_TIME = new Date("2026-01-15T18:00:00.000Z");

describe("buildDemoSessions", () => {
  it("covers every P0 display status at the reference time", () => {
    const sessions = buildDemoSessions(REFERENCE_TIME);
    const statuses = new Set(
      sessions.map((session) =>
        getSessionDisplayStatus(session, REFERENCE_TIME),
      ),
    );

    expect(statuses).toEqual(
      new Set([
        "upcoming",
        "starting_soon",
        "full",
        "in_progress",
        "cancelled",
        "ended",
      ]),
    );
  });

  it("includes at least one public and one unlisted session", () => {
    const sessions = buildDemoSessions(REFERENCE_TIME);
    expect(sessions.some((s) => s.visibility === "public")).toBe(true);
    expect(sessions.some((s) => s.visibility === "unlisted")).toBe(true);
  });

  it("marks the full-status session as full via the shared capacity rule", () => {
    const sessions = buildDemoSessions(REFERENCE_TIME);
    const fullSession = sessions.find(
      (session) => getSessionDisplayStatus(session, REFERENCE_TIME) === "full",
    );
    expect(fullSession).toBeDefined();
    expect(isSessionFull(fullSession!)).toBe(true);
  });

  it("does not expire relative to a later reference time", () => {
    const laterReferenceTime = new Date(
      REFERENCE_TIME.getTime() + 30 * 24 * 60 * 60 * 1000,
    );
    const sessions = buildDemoSessions(laterReferenceTime);
    const statuses = new Set(
      sessions.map((session) =>
        getSessionDisplayStatus(session, laterReferenceTime),
      ),
    );
    // Same categories are represented because timestamps are generated
    // relative to whatever reference time is supplied.
    expect(statuses).toEqual(
      new Set([
        "upcoming",
        "starting_soon",
        "full",
        "in_progress",
        "cancelled",
        "ended",
      ]),
    );
  });
});

describe("listDemoSessions", () => {
  it("excludes unlisted sessions from the ordinary public list", () => {
    const sessions = listDemoSessions(REFERENCE_TIME);
    expect(sessions.length).toBeGreaterThan(0);
    expect(sessions.every((session) => session.visibility === "public")).toBe(
      true,
    );
  });
});

describe("findPublicDemoSessionById", () => {
  it("finds an existing public session by id", () => {
    const [firstPublicSession] = listDemoSessions(REFERENCE_TIME);
    const found = findPublicDemoSessionById(
      firstPublicSession.id,
      REFERENCE_TIME,
    );
    expect(found?.id).toBe(firstPublicSession.id);
  });

  it("does not find an unlisted session by id", () => {
    const allSessions = buildDemoSessions(REFERENCE_TIME);
    const unlistedSession = allSessions.find(
      (session) => session.visibility === "unlisted",
    )!;
    expect(
      findPublicDemoSessionById(unlistedSession.id, REFERENCE_TIME),
    ).toBeUndefined();
  });

  it("returns undefined for an unknown id", () => {
    expect(
      findPublicDemoSessionById("not-a-real-id", REFERENCE_TIME),
    ).toBeUndefined();
  });
});

describe("findUnlistedDemoSessionByShareToken", () => {
  it("succeeds only with the matching token", () => {
    const allSessions = buildDemoSessions(REFERENCE_TIME);
    const unlistedSession = allSessions.find(
      (session) => session.visibility === "unlisted",
    )!;

    expect(
      findUnlistedDemoSessionByShareToken(
        unlistedSession.shareToken,
        REFERENCE_TIME,
      )?.id,
    ).toBe(unlistedSession.id);

    expect(
      findUnlistedDemoSessionByShareToken(
        "00000000-0000-4000-8000-000000000000",
        REFERENCE_TIME,
      ),
    ).toBeUndefined();
  });

  it("does not resolve a public session's token through the unlisted lookup", () => {
    const allSessions = buildDemoSessions(REFERENCE_TIME);
    const publicSession = allSessions.find(
      (session) => session.visibility === "public",
    )!;
    expect(
      findUnlistedDemoSessionByShareToken(
        publicSession.shareToken,
        REFERENCE_TIME,
      ),
    ).toBeUndefined();
  });
});
