"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { useEffect, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import {
  cancelSessionAction,
  joinSessionAction,
  leaveSessionAction,
} from "@/app/sessions/actions";
import type { SessionFormState } from "@/lib/validation/session";

const initialState: SessionFormState = {};

type Props = {
  sessionId: string;
  returnPath: string;
  canJoin: boolean;
  canLeave: boolean;
  canCancel: boolean;
  joined: boolean;
  disabledReason?: string;
};

function ActionMessage({ state }: { state: SessionFormState }) {
  if (!state.message) return null;
  return (
    <div
      role={state.code === "error" ? "alert" : "status"}
      className="border-border bg-muted/50 flex items-start gap-2 rounded-xl border p-3 text-sm"
    >
      {state.code === "error" ? (
        <AlertCircle
          className="mt-0.5 size-4 shrink-0 text-red-600"
          aria-hidden="true"
        />
      ) : (
        <CheckCircle2
          className="mt-0.5 size-4 shrink-0 text-emerald-600"
          aria-hidden="true"
        />
      )}
      <span>{state.message}</span>
    </div>
  );
}

export function SessionActions({
  sessionId,
  returnPath,
  canJoin,
  canLeave,
  canCancel,
  joined,
  disabledReason,
}: Props) {
  const router = useRouter();
  const [joinState, joinAction, joinPending] = useActionState(
    joinSessionAction,
    initialState,
  );
  const [leaveState, leaveAction, leavePending] = useActionState(
    leaveSessionAction,
    initialState,
  );
  const [cancelState, cancelAction, cancelPending] = useActionState(
    cancelSessionAction,
    initialState,
  );
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  useEffect(() => {
    if (
      joinState.code === "success" ||
      leaveState.code === "success" ||
      cancelState.code === "success"
    ) {
      router.refresh();
    }
  }, [cancelState.code, joinState.code, leaveState.code, router]);

  return (
    <div className="space-y-3">
      {canJoin ? (
        <form action={joinAction}>
          <input type="hidden" name="sessionId" value={sessionId} />
          <input type="hidden" name="returnPath" value={returnPath} />
          <button
            className={buttonVariants({ className: "w-full" })}
            disabled={joinPending}
          >
            {joinPending ? "Joining..." : "Join session"}
          </button>
        </form>
      ) : null}
      {canLeave ? (
        <form action={leaveAction}>
          <input type="hidden" name="sessionId" value={sessionId} />
          <input type="hidden" name="returnPath" value={returnPath} />
          <button
            className={buttonVariants({
              variant: "outline",
              className: "w-full",
            })}
            disabled={leavePending}
          >
            {leavePending ? "Leaving..." : "Leave session"}
          </button>
        </form>
      ) : null}
      {canCancel ? (
        <form action={cancelAction}>
          <input type="hidden" name="sessionId" value={sessionId} />
          <input type="hidden" name="returnPath" value={returnPath} />
          {confirmingCancel ? (
            <div className="space-y-2 rounded-xl border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-800">
                Cancel this session? People with the link will see it as
                cancelled.
              </p>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className={buttonVariants({
                    className: "flex-1 bg-red-700 hover:bg-red-800",
                  })}
                  disabled={cancelPending}
                >
                  {cancelPending ? "Cancelling..." : "Confirm cancellation"}
                </button>
                <button
                  type="button"
                  className={buttonVariants({
                    variant: "outline",
                    className: "flex-1",
                  })}
                  onClick={() => setConfirmingCancel(false)}
                  disabled={cancelPending}
                >
                  Keep session
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className={buttonVariants({
                variant: "outline",
                className: "w-full text-red-700 hover:text-red-700",
              })}
              onClick={() => setConfirmingCancel(true)}
            >
              Cancel session
            </button>
          )}
        </form>
      ) : null}
      {!canJoin && !canLeave && disabledReason ? (
        <p className="text-muted-foreground text-sm leading-6">
          {disabledReason}
        </p>
      ) : null}
      <ActionMessage state={joinState} />
      <ActionMessage state={leaveState} />
      <ActionMessage state={cancelState} />
      {joined && !canLeave ? (
        <p className="text-muted-foreground text-sm">
          You are joined, but this session is no longer open for changes.
        </p>
      ) : null}
    </div>
  );
}
