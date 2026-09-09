import { buildDemoSessions } from "@/lib/data/demo-sessions";
import { demoCourses, type DemoCourse } from "@/lib/data/demo-courses";
import {
  canJoinSession,
  canLeaveSession,
  getSessionDisplayStatus,
} from "@/lib/session-status";
import type { StudySession } from "@/lib/types/session";
import type { CreateSessionInput } from "@/lib/validation/session";

type StoreState = {
  sessions: Map<string, StudySession>;
  participants: Map<string, Set<string>>;
  nextId: number;
  seededIds: Set<string>;
};

const STORE_KEY = Symbol.for("studydrop.demo-session-store");
const globalStore = globalThis as typeof globalThis & {
  [STORE_KEY]?: StoreState;
};

function clone(session: StudySession): StudySession {
  return { ...session };
}

function createState(referenceTime: Date): StoreState {
  const sessions = new Map<string, StudySession>();
  const participants = new Map<string, Set<string>>();
  for (const session of buildDemoSessions(referenceTime)) {
    sessions.set(session.id, clone(session));
    participants.set(
      session.id,
      new Set(
        Array.from(
          { length: session.participantCount },
          (_, index) => `seed:${session.id}:${index}`,
        ),
      ),
    );
  }
  return {
    sessions,
    participants,
    nextId: 1,
    seededIds: new Set(sessions.keys()),
  };
}

function state(): StoreState {
  if (!globalStore[STORE_KEY]) {
    globalStore[STORE_KEY] = createState(new Date());
  }
  return globalStore[STORE_KEY];
}

function sessionWithCount(current: StudySession): StudySession {
  const participantCount = state().participants.get(current.id)?.size ?? 0;
  return { ...current, participantCount };
}

export function resetMockSessionStore(referenceTime = new Date()) {
  globalStore[STORE_KEY] = createState(referenceTime);
}

export function listMockSessions(): StudySession[] {
  return [...state().sessions.values()].map(sessionWithCount);
}

export function findMockSessionById(id: string): StudySession | undefined {
  const session = state().sessions.get(id);
  return session ? sessionWithCount(session) : undefined;
}

export function findMockSessionByShareToken(
  token: string,
): StudySession | undefined {
  const session = [...state().sessions.values()].find(
    (candidate) =>
      candidate.visibility === "unlisted" && candidate.shareToken === token,
  );
  return session ? sessionWithCount(session) : undefined;
}

export function isMockParticipant(id: string, actorId: string): boolean {
  return state().participants.get(id)?.has(actorId) ?? false;
}

export function createMockSession(
  input: CreateSessionInput & {
    hostId: string;
    hostDisplayName: string;
    course?: DemoCourse;
  },
): StudySession {
  const current = state();
  const sequence = String(current.nextId++).padStart(12, "0");
  const id = `55555555-5555-4555-8555-${sequence}`;
  const session: StudySession = {
    id,
    hostId: input.hostId,
    hostDisplayName: input.hostDisplayName,
    courseLabel: input.courseLabel,
    courseTitle:
      input.course?.title ??
      demoCourses.find(
        (course) =>
          `${course.subject} ${course.catalogNumber}` === input.courseLabel,
      )?.title ??
      input.courseLabel,
    topic: input.topic,
    purpose: input.purpose,
    collaborationStyle: input.collaborationStyle,
    meetingMode: input.meetingMode,
    locationLabel: input.locationLabel,
    meetingInstructions: input.meetingInstructions || null,
    organizerNotes: input.organizerNotes || null,
    startsAt: new Date(input.startsAt).toISOString(),
    endsAt: new Date(input.endsAt).toISOString(),
    capacity: input.capacity,
    participantCount: 0,
    visibility: input.visibility,
    shareToken: `66666666-6666-4666-8666-${sequence}`,
    cancelledAt: null,
  };
  current.sessions.set(id, session);
  current.participants.set(id, new Set());
  return clone(session);
}

export function joinMockSession(
  id: string,
  actorId: string,
  referenceTime = new Date(),
) {
  const session = findMockSessionById(id);
  if (!session)
    return { ok: false as const, message: "That session could not be found." };
  const members = state().participants.get(id)!;
  if (members.has(actorId))
    return {
      ok: false as const,
      message: "You have already joined this session.",
    };
  const eligibility = canJoinSession(session, actorId, referenceTime);
  if (!eligibility.eligible) {
    const messages = {
      cancelled: "This session was cancelled.",
      host: "The organizer is already counted in the session capacity.",
      full: "This session is full. Try another session or check back after someone leaves.",
      closed:
        "Joining is closed because this session has ended or passed its grace period.",
    };
    return { ok: false as const, message: messages[eligibility.reason!] };
  }
  members.add(actorId);
  return { ok: true as const, session: findMockSessionById(id)! };
}

export function leaveMockSession(
  id: string,
  actorId: string,
  referenceTime = new Date(),
) {
  const session = findMockSessionById(id);
  if (!session)
    return { ok: false as const, message: "That session could not be found." };
  const members = state().participants.get(id)!;
  if (!members.has(actorId))
    return {
      ok: false as const,
      message: "You are not currently joined to this session.",
    };
  const eligibility = canLeaveSession(session, actorId, referenceTime);
  if (!eligibility.eligible) {
    return {
      ok: false as const,
      message:
        eligibility.reason === "cancelled"
          ? "This session was cancelled."
          : "Leaving is closed because this session has ended or passed its grace period.",
    };
  }
  members.delete(actorId);
  return { ok: true as const, session: findMockSessionById(id)! };
}

export function cancelMockSession(
  id: string,
  actorId: string,
  referenceTime = new Date(),
) {
  const session = findMockSessionById(id);
  if (!session)
    return { ok: false as const, message: "That session could not be found." };
  if (session.hostId !== actorId)
    return {
      ok: false as const,
      message: "Only the organizer can cancel this session.",
    };
  if (session.cancelledAt)
    return {
      ok: false as const,
      message: "This session is already cancelled.",
    };
  if (getSessionDisplayStatus(session, referenceTime) === "ended") {
    return {
      ok: false as const,
      message: "Ended sessions cannot be cancelled.",
    };
  }
  state().sessions.set(id, {
    ...session,
    cancelledAt: referenceTime.toISOString(),
  });
  return { ok: true as const, session: findMockSessionById(id)! };
}
