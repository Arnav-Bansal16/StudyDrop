import {
  findMockSessionById,
  findMockSessionByShareToken,
  listMockSessions,
} from "@/lib/data/mock-session-store";
import type { StudySession } from "@/lib/types/session";

export function normalizeCourseSearchQuery(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function matchesCourseSearch(
  session: StudySession,
  searchQuery: string,
): boolean {
  const query = normalizeCourseSearchQuery(searchQuery);

  if (!query) {
    return true;
  }

  const subjectAndNumber = session.courseLabel.toLowerCase();
  const title = session.courseTitle.toLowerCase();
  const combined = `${subjectAndNumber} ${title}`;

  return (
    combined.includes(query) ||
    session.courseLabel
      .toLowerCase()
      .replace(/\s+/g, "")
      .includes(query.replace(/\s+/g, ""))
  );
}

export function listBrowseSessions(
  referenceTime: Date = new Date(),
  searchQuery = "",
): StudySession[] {
  const normalizedQuery = normalizeCourseSearchQuery(searchQuery);

  return listMockSessions(referenceTime)
    .filter((session) => session.visibility === "public")
    .filter(
      (session) =>
        new Date(session.startsAt).getTime() > referenceTime.getTime(),
    )
    .filter((session) => session.cancelledAt === null)
    .filter((session) => matchesCourseSearch(session, normalizedQuery))
    .sort(
      (left, right) =>
        new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime(),
    );
}

export function findBrowseSessionById(
  id: string,
  referenceTime: Date = new Date(),
): StudySession | undefined {
  const session = findMockSessionById(id, referenceTime);
  return session?.visibility === "public" ? session : undefined;
}

export function findUnlistedSessionByToken(
  token: string,
  referenceTime: Date = new Date(),
): StudySession | undefined {
  return findMockSessionByShareToken(token, referenceTime);
}
