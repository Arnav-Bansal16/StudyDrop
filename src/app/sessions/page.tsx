import type { Metadata } from "next";
import {
  ArrowRight,
  BookOpenText,
  Clock3,
  MapPin,
  Search,
  UserRound,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getOccupancy, getSessionDisplayStatus } from "@/lib/session-status";
import { listBrowseSessions } from "@/lib/session-discovery";
import type { StudySession } from "@/lib/types/session";

export const metadata: Metadata = { title: "Browse sessions" };

type PageProps = {
  searchParams?: Promise<{ q?: string | string[] }>;
};

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

  const formatter = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const endFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  if (sameDay) {
    return `${formatter.format(start)} · ${start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}–${end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
  }

  return `${formatter.format(start)}–${endFormatter.format(end)}`;
}

function getStatusLabel(status: string): string {
  switch (status) {
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

function SessionCard({ session }: { session: StudySession }) {
  const displayStatus = getSessionDisplayStatus(session, new Date());
  const occupancy = getOccupancy(session);
  const availableSeats = Math.max(0, session.capacity - occupancy);

  return (
    <Card className="group h-full overflow-hidden transition-transform duration-200 hover:-translate-y-0.5">
      <CardContent className="flex h-full flex-col gap-5 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-primary font-mono text-[0.68rem] font-semibold tracking-[0.16em] uppercase">
              {session.courseLabel}
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em]">
              {session.topic}
            </h2>
          </div>
          <Badge className="shrink-0">{getStatusLabel(displayStatus)}</Badge>
        </div>

        <div className="text-muted-foreground text-sm leading-6">
          <p className="text-foreground font-medium">{session.courseTitle}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge className="bg-secondary text-secondary-foreground">
              {formatPurpose(session.purpose)}
            </Badge>
            <Badge className="bg-secondary text-secondary-foreground">
              {formatStyle(session.collaborationStyle)}
            </Badge>
          </div>
        </div>

        <dl className="text-muted-foreground space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <Clock3
              className="text-primary mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <dd className="text-foreground">
              {formatSessionWindow(session.startsAt, session.endsAt)}
            </dd>
          </div>
          <div className="flex items-start gap-3">
            <MapPin
              className="text-primary mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <dd className="text-foreground">{session.locationLabel}</dd>
          </div>
          <div className="flex items-start gap-3">
            <UsersRound
              className="text-primary mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <dd className="text-foreground">
              {occupancy} of {session.capacity} seats filled · {availableSeats}{" "}
              open
            </dd>
          </div>
        </dl>

        <div className="border-border mt-auto flex items-center justify-between gap-3 border-t pt-4">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <UserRound className="text-primary size-4" aria-hidden="true" />
            <span>{session.hostDisplayName}</span>
          </div>
          <Link
            href={`/sessions/${session.id}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            View session
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function SessionsPage({ searchParams }: PageProps) {
  const resolvedParams = (await (searchParams ?? Promise.resolve({}))) as {
    q?: string | string[];
  };
  const rawQuery = Array.isArray(resolvedParams.q)
    ? (resolvedParams.q[0] ?? "")
    : (resolvedParams.q ?? "");
  const query = rawQuery.trim();
  const sessions = listBrowseSessions(new Date(), query);

  return (
    <main className="page-container py-10 sm:py-12">
      <section className="mb-8 flex flex-col gap-6">
        <div className="space-y-3">
          <p className="text-primary font-mono text-[0.68rem] font-semibold tracking-[0.18em] uppercase">
            Browse sessions
          </p>
          <h1 className="text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
            Upcoming study sessions
          </h1>
        </div>

        <form action="/sessions" method="get" className="w-full">
          <label htmlFor="course-search" className="sr-only">
            Search by course
          </label>
          <div className="border-border bg-card flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm">
            <Search
              className="text-muted-foreground size-4 shrink-0"
              aria-hidden="true"
            />
            <input
              id="course-search"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search by course subject, number, or title"
              className="placeholder:text-muted-foreground text-foreground w-full border-0 bg-transparent text-base outline-none"
            />
            {query ? (
              <Link
                href="/sessions"
                className="text-primary text-sm font-medium"
              >
                Clear
              </Link>
            ) : null}
          </div>
        </form>
      </section>

      {sessions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 px-6 py-12 text-center sm:px-10">
            <div className="bg-secondary text-primary grid size-14 place-items-center rounded-2xl">
              <BookOpenText className="size-6" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-[-0.04em]">
                No sessions match that course search.
              </h2>
              <p className="text-muted-foreground text-base">
                Try a different subject, course number, or title.
              </p>
            </div>
            <Link href="/sessions" className={buttonVariants()}>
              Clear search
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </main>
  );
}
