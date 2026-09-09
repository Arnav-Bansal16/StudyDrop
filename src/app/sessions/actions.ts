"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getDemoUser, requireAuthenticatedUser } from "@/lib/auth";
import { getDemoUserId } from "@/lib/demo-user";
import {
  cancelMockSession,
  createMockSession,
  joinMockSession,
  leaveMockSession,
} from "@/lib/data/mock-session-store";
import { buildSafeNextPath } from "@/lib/validation/auth";
import {
  flattenSessionErrors,
  validateCreateSessionInput,
  type SessionFormState,
} from "@/lib/validation/session";

function returnPath(formData: FormData, fallback: string) {
  return buildSafeNextPath(
    String(formData.get("returnPath") ?? fallback),
    fallback,
  );
}

export async function createSessionAction(
  _prev: SessionFormState | undefined,
  formData: FormData,
): Promise<SessionFormState> {
  const user = await requireAuthenticatedUser("/sessions/new");
  const raw = Object.fromEntries(formData.entries());
  const parsed = validateCreateSessionInput(raw);
  if (!parsed.success) {
    return {
      code: "error",
      message: "Please fix the highlighted fields and try again.",
      fieldErrors: flattenSessionErrors(parsed.error),
    };
  }

  const session = createMockSession({
    ...parsed.data,
    hostId: getDemoUserId(user),
    hostDisplayName: user.displayName,
  });
  redirect(
    session.visibility === "unlisted"
      ? `/s/${session.shareToken}`
      : `/sessions/${session.id}`,
  );
}

export async function joinSessionAction(
  _prev: SessionFormState | undefined,
  formData: FormData,
): Promise<SessionFormState> {
  const path = returnPath(formData, "/sessions");
  const user = await requireAuthenticatedUser(path);
  const result = joinMockSession(
    String(formData.get("sessionId") ?? ""),
    getDemoUserId(user),
  );
  if (!result.ok) return { code: "error", message: result.message };
  revalidatePath(path);
  revalidatePath("/sessions");
  revalidatePath("/dashboard");
  return { code: "success", message: "You joined this session." };
}

export async function leaveSessionAction(
  _prev: SessionFormState | undefined,
  formData: FormData,
): Promise<SessionFormState> {
  const path = returnPath(formData, "/sessions");
  const user = await requireAuthenticatedUser(path);
  const result = leaveMockSession(
    String(formData.get("sessionId") ?? ""),
    getDemoUserId(user),
  );
  if (!result.ok) return { code: "error", message: result.message };
  revalidatePath(path);
  revalidatePath("/dashboard");
  return { code: "success", message: "You left this session." };
}

export async function cancelSessionAction(
  _prev: SessionFormState | undefined,
  formData: FormData,
): Promise<SessionFormState> {
  const path = returnPath(formData, "/dashboard");
  const user = await requireAuthenticatedUser(path);
  const result = cancelMockSession(
    String(formData.get("sessionId") ?? ""),
    getDemoUserId(user),
  );
  if (!result.ok) return { code: "error", message: result.message };
  revalidatePath(path);
  revalidatePath("/sessions");
  revalidatePath("/dashboard");
  return { code: "success", message: "Session cancelled." };
}

export async function getCurrentUserId() {
  const user = await getDemoUser();
  return user ? getDemoUserId(user) : null;
}
