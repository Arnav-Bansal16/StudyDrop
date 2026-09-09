import { z } from "zod";

import type {
  CollaborationStyle,
  MeetingMode,
  SessionPurpose,
  SessionVisibility,
} from "@/lib/types/session";
import { demoCourses } from "@/lib/data/demo-courses";

export const sessionPurposeValues = [
  "homework",
  "exam_review",
  "project_work",
  "concept_questions",
  "quiet_coworking",
] as const satisfies readonly SessionPurpose[];

export const collaborationStyleValues = [
  "collaborative",
  "focused",
  "peer_teaching",
] as const satisfies readonly CollaborationStyle[];

export const meetingModeValues = ["in_person", "online"] as const satisfies readonly MeetingMode[];
export const visibilityValues = ["public", "unlisted"] as const satisfies readonly SessionVisibility[];

export const createSessionSchema = z.object({
  courseLabel: z.string().trim().min(1, "Choose a course."),
  topic: z.string().trim().min(3, "Topic must be at least 3 characters.").max(120, "Topic must be 120 characters or fewer."),
  purpose: z.enum(sessionPurposeValues),
  collaborationStyle: z.enum(collaborationStyleValues),
  meetingMode: z.enum(meetingModeValues),
  locationLabel: z.string().trim().min(2, "Add a meeting location.").max(120, "Location must be 120 characters or fewer."),
  startsAt: z.string().min(1, "Choose a start time."),
  endsAt: z.string().min(1, "Choose an end time."),
  capacity: z.coerce.number().int("Capacity must be a whole number.").min(2, "Capacity must be at least 2.").max(20, "Capacity cannot exceed 20."),
  visibility: z.enum(visibilityValues),
  meetingInstructions: z.string().trim().max(500, "Meeting instructions must be 500 characters or fewer."),
  organizerNotes: z.string().trim().max(500, "Notes must be 500 characters or fewer."),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;

export type SessionFormState = {
  code?: "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export function validateCreateSessionInput(
  input: unknown,
  referenceTime = new Date(),
) {
  const parsed = createSessionSchema.safeParse(input);
  if (!parsed.success) {
    return parsed;
  }

  const course = demoCourses.find(
    (candidate) => `${candidate.subject} ${candidate.catalogNumber}` === parsed.data.courseLabel,
  );
  if (!course) {
    return {
      success: false as const,
      error: { flatten: () => ({ fieldErrors: { courseLabel: ["Choose a course from the catalog."] } }) },
    };
  }

  const startsAt = new Date(parsed.data.startsAt);
  const endsAt = new Date(parsed.data.endsAt);
  const duration = endsAt.getTime() - startsAt.getTime();
  const minimumStart = referenceTime.getTime() + 15 * 60 * 1000;

  const fieldErrors: Record<string, string> = {};
  if (Number.isNaN(startsAt.getTime())) fieldErrors.startsAt = "Choose a valid start time.";
  if (Number.isNaN(endsAt.getTime())) fieldErrors.endsAt = "Choose a valid end time.";
  if (!fieldErrors.startsAt && startsAt.getTime() < minimumStart) {
    fieldErrors.startsAt = "Start time must be at least 15 minutes from now.";
  }
  if (!fieldErrors.startsAt && !fieldErrors.endsAt && endsAt <= startsAt) {
    fieldErrors.endsAt = "End time must be after the start time.";
  }
  if (!fieldErrors.startsAt && !fieldErrors.endsAt && (duration < 30 * 60 * 1000 || duration > 6 * 60 * 60 * 1000)) {
    fieldErrors.endsAt = "Sessions must last between 30 minutes and 6 hours.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      success: false as const,
      error: { flatten: () => ({ fieldErrors }) },
    };
  }

  return { success: true as const, data: { ...parsed.data, course } };
}

export function flattenSessionErrors(error: { flatten: () => { fieldErrors: Record<string, string | string[] | undefined> } }) {
  return Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).flatMap(([key, messages]) =>
      messages ? [[key, Array.isArray(messages) ? messages[0] : messages]] : [],
    ),
  );
}
