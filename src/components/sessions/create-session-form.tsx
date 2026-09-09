"use client";

import { AlertCircle, ArrowRight } from "lucide-react";
import { useActionState } from "react";

import { createSessionAction } from "@/app/sessions/actions";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { DemoCourse } from "@/lib/data/demo-courses";
import type { SessionFormState } from "@/lib/validation/session";

const initialState: SessionFormState = {};

function localDateTime(minutesFromNow: number) {
  const date = new Date(Date.now() + minutesFromNow * 60 * 1000);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1000).toISOString().slice(0, 16);
}

export function CreateSessionForm({ courses }: { courses: DemoCourse[] }) {
  const [state, formAction, isPending] = useActionState(createSessionAction, initialState);
  return (
    <Card>
      <CardContent className="p-6 sm:p-8">
        <form action={formAction} className="grid gap-5 sm:grid-cols-2">
          <Field label="Course" name="courseLabel" error={state.fieldErrors?.courseLabel}>
            <select id="courseLabel" name="courseLabel" className="input" defaultValue="">
              <option value="" disabled>Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={`${course.subject} ${course.catalogNumber}`}>
                  {course.subject} {course.catalogNumber} · {course.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Topic" name="topic" error={state.fieldErrors?.topic}>
            <input id="topic" name="topic" placeholder="Exam review: practice problems" className="input" />
          </Field>
          <Field label="Purpose" name="purpose" error={state.fieldErrors?.purpose}>
            <select id="purpose" name="purpose" className="input" defaultValue="homework">
              <option value="homework">Homework</option>
              <option value="exam_review">Exam review</option>
              <option value="project_work">Project work</option>
              <option value="concept_questions">Concept questions</option>
              <option value="quiet_coworking">Quiet co-working</option>
            </select>
          </Field>
          <Field label="Collaboration style" name="collaborationStyle" error={state.fieldErrors?.collaborationStyle}>
            <select id="collaborationStyle" name="collaborationStyle" className="input" defaultValue="collaborative">
              <option value="collaborative">Collaborative</option>
              <option value="focused">Focused</option>
              <option value="peer_teaching">Peer teaching</option>
            </select>
          </Field>
          <Field label="Meeting mode" name="meetingMode" error={state.fieldErrors?.meetingMode}>
            <select id="meetingMode" name="meetingMode" className="input" defaultValue="in_person">
              <option value="in_person">In person</option>
              <option value="online">Online</option>
            </select>
          </Field>
          <Field label="Location or link" name="locationLabel" error={state.fieldErrors?.locationLabel}>
            <input id="locationLabel" name="locationLabel" placeholder="Kennedy Library, room 220" className="input" />
          </Field>
          <Field label="Starts" name="startsAt" error={state.fieldErrors?.startsAt}>
            <input id="startsAt" name="startsAt" type="datetime-local" defaultValue={localDateTime(60)} className="input" />
          </Field>
          <Field label="Ends" name="endsAt" error={state.fieldErrors?.endsAt}>
            <input id="endsAt" name="endsAt" type="datetime-local" defaultValue={localDateTime(120)} className="input" />
          </Field>
          <Field label="Capacity (including you)" name="capacity" error={state.fieldErrors?.capacity}>
            <input id="capacity" name="capacity" type="number" min="2" max="20" defaultValue="4" className="input" />
          </Field>
          <Field label="Visibility" name="visibility" error={state.fieldErrors?.visibility}>
            <select id="visibility" name="visibility" className="input" defaultValue="public">
              <option value="public">Public — discoverable in browse</option>
              <option value="unlisted">Unlisted — link only</option>
            </select>
          </Field>
          <Field label="Meeting instructions" name="meetingInstructions" error={state.fieldErrors?.meetingInstructions} full>
            <textarea id="meetingInstructions" name="meetingInstructions" rows={3} placeholder="How should people find or join?" className="input" />
          </Field>
          <Field label="Organizer notes" name="organizerNotes" error={state.fieldErrors?.organizerNotes} full>
            <textarea id="organizerNotes" name="organizerNotes" rows={3} placeholder="What should participants bring or know?" className="input" />
          </Field>
          {state.message ? (
            <div role="alert" className="border-border bg-muted/50 flex items-start gap-2 rounded-xl border p-3 text-sm sm:col-span-2">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden="true" />
              <span>{state.message}</span>
            </div>
          ) : null}
          <button type="submit" disabled={isPending} className={buttonVariants({ size: "lg", className: "sm:col-span-2" })}>
            {isPending ? "Creating session..." : "Create session"}
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  name,
  error,
  children,
  full,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`space-y-2 ${full ? "sm:col-span-2" : ""}`}>
      <label htmlFor={name} className="text-sm font-medium">{label}</label>
      {children}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
