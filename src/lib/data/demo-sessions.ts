import type { StudySession } from "@/lib/types/session";

/**
 * Deterministic demo data + a minimal read-only data-access boundary.
 *
 * Every session is generated relative to a `referenceTime` (default:
 * "now") rather than fixed timestamps, so the dataset never silently
 * expires into the wrong status category as real time passes. Prompt 4
 * replaces this module with Supabase-backed reads behind the same
 * function shapes; page components should depend on those shapes, not
 * on this file directly, once that swap happens.
 *
 * This intentionally stays a flat list of functions — no generic
 * repository interface, DI container, or speculative abstraction.
 */

const MINUTE_MS = 60 * 1000;

function offsetIso(referenceTime: Date, minutes: number): string {
  return new Date(referenceTime.getTime() + minutes * MINUTE_MS).toISOString();
}

/**
 * Builds the deterministic demo dataset relative to `referenceTime`.
 * Covers every P0 display status (upcoming, starting soon, full, in
 * progress, cancelled, ended) and both visibility values (public,
 * unlisted).
 */
export function buildDemoSessions(
  referenceTime: Date = new Date(),
): StudySession[] {
  return [
    {
      id: "11111111-1111-4111-8111-111111111101",
      hostId: "host-maya",
      hostDisplayName: "Maya Chen",
      courseLabel: "CSC 357",
      courseTitle: "Systems Programming",
      topic: "Malloc lab review before the deadline",
      purpose: "homework",
      collaborationStyle: "collaborative",
      meetingMode: "in_person",
      locationLabel: "Kennedy Library, 2nd floor group room",
      meetingInstructions: "Look for the whiteboard table near the windows.",
      organizerNotes: "Bring your own laptop; we'll compare test results.",
      startsAt: offsetIso(referenceTime, 3 * 24 * 60),
      endsAt: offsetIso(referenceTime, 3 * 24 * 60 + 90),
      capacity: 6,
      participantCount: 2,
      visibility: "public",
      shareToken: "21111111-1111-4111-8111-111111111101",
      cancelledAt: null,
    },
    {
      id: "11111111-1111-4111-8111-111111111102",
      hostId: "host-devon",
      hostDisplayName: "Devon Ruiz",
      courseLabel: "MATH 244",
      courseTitle: "Linear Analysis I",
      topic: "Eigenvalue practice before tomorrow's quiz",
      purpose: "exam_review",
      collaborationStyle: "peer_teaching",
      meetingMode: "in_person",
      locationLabel: "Building 38, Room 129",
      meetingInstructions: null,
      organizerNotes: "I'll walk through last year's quiz problems.",
      startsAt: offsetIso(referenceTime, 30),
      endsAt: offsetIso(referenceTime, 30 + 60),
      capacity: 4,
      participantCount: 1,
      visibility: "public",
      shareToken: "21111111-1111-4111-8111-111111111102",
      cancelledAt: null,
    },
    {
      id: "11111111-1111-4111-8111-111111111103",
      hostId: "host-priya",
      hostDisplayName: "Priya Nair",
      courseLabel: "CPE 315",
      courseTitle: "Computer Architecture",
      topic: "Cache design project, part 2",
      purpose: "project_work",
      collaborationStyle: "collaborative",
      meetingMode: "online",
      locationLabel: "Zoom (link in meeting instructions)",
      meetingInstructions: "https://calpoly.zoom.us/example-room",
      organizerNotes: null,
      startsAt: offsetIso(referenceTime, 2 * 24 * 60),
      endsAt: offsetIso(referenceTime, 2 * 24 * 60 + 60),
      capacity: 3,
      participantCount: 2,
      visibility: "public",
      shareToken: "21111111-1111-4111-8111-111111111103",
      cancelledAt: null,
    },
    {
      id: "11111111-1111-4111-8111-111111111104",
      hostId: "host-sam",
      hostDisplayName: "Sam Okafor",
      courseLabel: "STAT 312",
      courseTitle: "Statistical Methods for Engineers",
      topic: "Homework 6 problem walkthrough",
      purpose: "homework",
      collaborationStyle: "focused",
      meetingMode: "in_person",
      locationLabel: "Julian A. McPhee University Union, Room 220",
      meetingInstructions: "Quiet room — headphones optional.",
      organizerNotes: null,
      startsAt: offsetIso(referenceTime, -30),
      endsAt: offsetIso(referenceTime, 30),
      capacity: 5,
      participantCount: 3,
      visibility: "unlisted",
      shareToken: "21111111-1111-4111-8111-111111111104",
      cancelledAt: null,
    },
    {
      id: "11111111-1111-4111-8111-111111111105",
      hostId: "host-elena",
      hostDisplayName: "Elena Torres",
      courseLabel: "CHEM 216",
      courseTitle: "Organic Chemistry Laboratory",
      topic: "Pre-lab concept questions",
      purpose: "concept_questions",
      collaborationStyle: "collaborative",
      meetingMode: "in_person",
      locationLabel: "Baker Science, Room 180",
      meetingInstructions: null,
      organizerNotes: "Cancelled — moved to office hours instead.",
      startsAt: offsetIso(referenceTime, 5 * 24 * 60),
      endsAt: offsetIso(referenceTime, 5 * 24 * 60 + 60),
      capacity: 8,
      participantCount: 4,
      visibility: "public",
      shareToken: "21111111-1111-4111-8111-111111111105",
      cancelledAt: offsetIso(referenceTime, -60),
    },
    {
      id: "11111111-1111-4111-8111-111111111106",
      hostId: "host-noah",
      hostDisplayName: "Noah Park",
      courseLabel: "CSC 202",
      courseTitle: "Data Structures",
      topic: "Quiet co-working before finals week",
      purpose: "quiet_coworking",
      collaborationStyle: "focused",
      meetingMode: "in_person",
      locationLabel: "Kennedy Library, 3rd floor",
      meetingInstructions: null,
      organizerNotes: null,
      startsAt: offsetIso(referenceTime, -2 * 24 * 60),
      endsAt: offsetIso(referenceTime, -2 * 24 * 60 + 60),
      capacity: 6,
      participantCount: 3,
      visibility: "public",
      shareToken: "21111111-1111-4111-8111-111111111106",
      cancelledAt: null,
    },
  ];
}

/** Lists demo sessions. Unlisted sessions are never part of this result. */
export function listDemoSessions(
  referenceTime: Date = new Date(),
): StudySession[] {
  return buildDemoSessions(referenceTime).filter(
    (session) => session.visibility === "public",
  );
}

/** Finds a single public session by id. Unlisted sessions are never returned here. */
export function findPublicDemoSessionById(
  id: string,
  referenceTime: Date = new Date(),
): StudySession | undefined {
  return buildDemoSessions(referenceTime).find(
    (session) => session.visibility === "public" && session.id === id,
  );
}

/**
 * Finds a single unlisted session by its bearer share token. Only an
 * exact token match resolves a session; nothing is enumerable from an id.
 */
export function findUnlistedDemoSessionByShareToken(
  shareToken: string,
  referenceTime: Date = new Date(),
): StudySession | undefined {
  return buildDemoSessions(referenceTime).find(
    (session) =>
      session.visibility === "unlisted" && session.shareToken === shareToken,
  );
}
