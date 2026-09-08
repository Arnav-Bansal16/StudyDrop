/**
 * Canonical StudySession presentation model.
 *
 * This type mirrors the `study_sessions` columns documented in
 * IMPLEMENTATION_PLAN.md that are required for the P0 browse/detail
 * presentation. It intentionally excludes database-only concerns
 * (audit timestamps, row ids for joins, etc.) that have no presentation
 * value yet. Prompt 4 will introduce a generated `database.types.ts`;
 * this module stays the single source of truth for the shape consumed
 * by pages and components until that replacement lands.
 */

export type SessionPurpose =
  | "homework"
  | "exam_review"
  | "project_work"
  | "concept_questions"
  | "quiet_coworking";

export type CollaborationStyle = "collaborative" | "focused" | "peer_teaching";

export type MeetingMode = "in_person" | "online";

export type SessionVisibility = "public" | "unlisted";

/**
 * All timestamp fields are ISO-8601 strings in UTC (e.g. produced by
 * `Date#toISOString()`). Business-rule functions must be given an
 * explicit reference time rather than reading the system clock, so
 * conversion to `Date` happens at the call site (see session-status.ts).
 */
export interface StudySession {
  id: string;
  hostId: string;
  hostDisplayName: string;
  courseLabel: string;
  courseTitle: string;
  topic: string;
  purpose: SessionPurpose;
  collaborationStyle: CollaborationStyle;
  meetingMode: MeetingMode;
  locationLabel: string;
  meetingInstructions: string | null;
  organizerNotes: string | null;
  startsAt: string;
  endsAt: string;
  /** Total people the session can hold, including the organizer. */
  capacity: number;
  /** Joined participants only; the host is never counted here. */
  participantCount: number;
  visibility: SessionVisibility;
  /**
   * Bearer credential for the unlisted route (`/s/[token]`). Present on
   * every row (mirroring the database default), but the data-access
   * boundary only ever returns it to callers that already resolved an
   * unlisted session through the token itself.
   */
  shareToken: string;
  /** Null until cancelled. Cancellation is not deletion. */
  cancelledAt: string | null;
}
