import type { Metadata } from "next";
import { ArrowLeft, Clock3, MapPin, UserRound, UsersRound } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { findBrowseSessionById } from "@/lib/session-discovery";
import { getOccupancy, getSessionDisplayStatus } from "@/lib/session-status";

function formatStatusLabel(value: string): string {
  switch (value) {
    case "cancelled":
      return "Cancelled";
    case "ended":
      return "Ended";
    case "in_progress":
      return "In progress";
    case "full":
      return "Full";
    case "starting_soon":
      return "Starting soon";
    default:
      return "Upcoming";
  }
}

function formatPurpose(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatStyle(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatSessionWindow(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const sameDay = start.toDateString() === end.toDateString();

  if (sameDay) {
    return `${new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(start)} · ${start.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })}–${end.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  }

  return `${new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(start)}–${new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(end)}`;
}

type PageProps = {
  params?: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await (params ?? Promise.resolve({ id: "" }));
  const session = findBrowseSessionById(resolvedParams.id, new Date());

  if (!session) {
    return { title: "Session not found" };
  }

  return {
    title: `${session.courseLabel} · ${session.topic}`,
    description: `${session.courseTitle} session with ${session.hostDisplayName}.`,
  };
}

export default async function PublicSessionPage({ params }: PageProps) {
  const resolvedParams = await (params ?? Promise.resolve({ id: "" }));
  const session = findBrowseSessionById(resolvedParams.id, new Date());

  if (!session) {
    notFound();
  }

  const status = getSessionDisplayStatus(session, new Date());
  const occupancy = getOccupancy(session);

  return (
    <main className="page-container py-10 sm:py-12">
      <Link
        href="/sessions"
        className={`${buttonVariants({ variant: "outline" })} mb-6`}
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to browse
      </Link>

      <article className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{formatStatusLabel(status)}</Badge>
            <Badge className="bg-secondary text-secondary-foreground">
              {session.visibility === "public" ? "Public" : "Unlisted"}
            </Badge>
          </div>

          <div className="space-y-3">
            <p className="text-primary font-mono text-[0.68rem] font-semibold tracking-[0.18em] uppercase">
              {session.courseLabel}
            </p>
            <h1 className="text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
              {session.topic}
            </h1>
            <p className="text-muted-foreground text-lg">
              {session.courseTitle}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge className="bg-secondary text-secondary-foreground">
              {formatPurpose(session.purpose)}
            </Badge>
            <Badge className="bg-secondary text-secondary-foreground">
              {formatStyle(session.collaborationStyle)}
            </Badge>
          </div>

          <Card>
            <CardContent className="space-y-4 p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <Clock3
                  className="text-primary mt-0.5 size-5 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-muted-foreground text-sm">Time</p>
                  <p className="text-foreground mt-1 text-base font-medium">
                    {formatSessionWindow(session.startsAt, session.endsAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin
                  className="text-primary mt-0.5 size-5 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-muted-foreground text-sm">Location</p>
                  <p className="text-foreground mt-1 text-base font-medium">
                    {session.locationLabel}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <UsersRound
                  className="text-primary mt-0.5 size-5 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-muted-foreground text-sm">Occupancy</p>
                  <p className="text-foreground mt-1 text-base font-medium">
                    {occupancy} of {session.capacity} seats filled
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <UserRound
                  className="text-primary mt-0.5 size-5 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-muted-foreground text-sm">Host</p>
                  <p className="text-foreground mt-1 text-base font-medium">
                    {session.hostDisplayName}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-5">
          <Card>
            <CardContent className="space-y-4 p-5 sm:p-6">
              <h2 className="text-lg font-semibold tracking-[-0.03em]">
                Session details
              </h2>
              <div className="space-y-5">
                {session.meetingInstructions ? (
                  <div>
                    <h3 className="text-muted-foreground text-sm font-semibold tracking-[0.12em] uppercase">
                      Meeting instructions
                    </h3>
                    <p className="text-foreground mt-2 leading-7">
                      {session.meetingInstructions}
                    </p>
                  </div>
                ) : null}

                {session.organizerNotes ? (
                  <div>
                    <h3 className="text-muted-foreground text-sm font-semibold tracking-[0.12em] uppercase">
                      Organizer notes
                    </h3>
                    <p className="text-foreground mt-2 leading-7">
                      {session.organizerNotes}
                    </p>
                  </div>
                ) : null}

                {!session.meetingInstructions && !session.organizerNotes ? (
                  <p className="text-muted-foreground text-sm leading-7">
                    No meeting instructions or organizer notes were shared for
                    this session.
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </aside>
      </article>
    </main>
  );
}
