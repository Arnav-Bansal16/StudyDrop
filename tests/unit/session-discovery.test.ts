import { describe, expect, it } from "vitest";

import {
  findBrowseSessionById,
  findUnlistedSessionByToken,
  listBrowseSessions,
  matchesCourseSearch,
} from "@/lib/session-discovery";
import { buildDemoSessions } from "@/lib/data/demo-sessions";

const REFERENCE_TIME = new Date("2026-01-15T18:00:00.000Z");

describe("matchesCourseSearch", () => {
  it("matches course subject, number, and title case-insensitively", () => {
    const session = buildDemoSessions(REFERENCE_TIME)[0];

    expect(matchesCourseSearch(session, "CSC")).toBe(true);
    expect(matchesCourseSearch(session, "357")).toBe(true);
    expect(matchesCourseSearch(session, "systems programming")).toBe(true);
    expect(matchesCourseSearch(session, "calc")).toBe(false);
  });
});

describe("listBrowseSessions", () => {
  it("returns only future public sessions in the earliest-first order", () => {
    const sessions = listBrowseSessions(REFERENCE_TIME);

    expect(sessions.every((session) => session.visibility === "public")).toBe(
      true,
    );
    expect(
      sessions.every(
        (session) =>
          new Date(session.startsAt).getTime() > REFERENCE_TIME.getTime(),
      ),
    ).toBe(true);
    expect(sessions).toEqual(
      [...sessions].sort(
        (left, right) =>
          new Date(left.startsAt).getTime() -
          new Date(right.startsAt).getTime(),
      ),
    );
  });

  it("filters by course search and resets when the query is empty", () => {
    const byNumber = listBrowseSessions(REFERENCE_TIME, "357");
    const byTitle = listBrowseSessions(REFERENCE_TIME, "systems programming");
    const all = listBrowseSessions(REFERENCE_TIME, "");

    expect(byNumber.length).toBeGreaterThan(0);
    expect(byTitle.length).toBeGreaterThan(0);
    expect(all.length).toBeGreaterThan(byNumber.length);
    expect(all.length).toBeGreaterThan(byTitle.length);
  });
});

describe("public and unlisted routing", () => {
  it("finds a public session by id and never resolves an unlisted session there", () => {
    const allSessions = buildDemoSessions(REFERENCE_TIME);
    const publicSession = allSessions.find(
      (session) => session.visibility === "public",
    );
    const unlistedSession = allSessions.find(
      (session) => session.visibility === "unlisted",
    );

    expect(findBrowseSessionById(publicSession!.id, REFERENCE_TIME)?.id).toBe(
      publicSession!.id,
    );
    expect(
      findBrowseSessionById(unlistedSession!.id, REFERENCE_TIME),
    ).toBeUndefined();
    expect(
      findBrowseSessionById("not-a-real-id", REFERENCE_TIME),
    ).toBeUndefined();
  });

  it("finds the valid unlisted session by token without exposing public tokens", () => {
    const allSessions = buildDemoSessions(REFERENCE_TIME);
    const unlistedSession = allSessions.find(
      (session) => session.visibility === "unlisted",
    );
    const publicSession = allSessions.find(
      (session) => session.visibility === "public",
    );

    expect(
      findUnlistedSessionByToken(unlistedSession!.shareToken, REFERENCE_TIME)
        ?.id,
    ).toBe(unlistedSession!.id);
    expect(
      findUnlistedSessionByToken(publicSession!.shareToken, REFERENCE_TIME),
    ).toBeUndefined();
    expect(
      findUnlistedSessionByToken(
        "00000000-0000-4000-8000-000000000000",
        REFERENCE_TIME,
      ),
    ).toBeUndefined();
  });
});
