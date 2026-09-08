import {
  ArrowRight,
  BookOpen,
  Clock3,
  Link2,
  MapPin,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const steps = [
  {
    number: "01",
    title: "Find your course",
    description:
      "Browse sessions tied to the class and kind of work you need help with.",
  },
  {
    number: "02",
    title: "Choose your pace",
    description:
      "Pick collaborative, focused, or peer-teaching sessions that fit how you work.",
  },
  {
    number: "03",
    title: "Meet soon",
    description:
      "Join a small session with a clear time, place, purpose, and seat limit.",
  },
];

export default function HomePage() {
  return (
    <main>
      <section className="border-border relative isolate overflow-hidden border-b">
        <div className="hero-grid absolute inset-0 -z-10" aria-hidden="true" />
        <div className="page-container grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 lg:py-28">
          <div className="max-w-2xl">
            <Badge className="bg-card mb-6 gap-2">
              <span
                className="bg-primary size-1.5 rounded-full"
                aria-hidden="true"
              />
              Built for Cal Poly study life
            </Badge>
            <h1 className="text-5xl leading-[0.98] font-semibold tracking-[-0.065em] text-balance sm:text-6xl lg:text-7xl">
              Study better,
              <span className="text-primary block">together.</span>
            </h1>
            <p className="text-muted-foreground mt-7 max-w-xl text-lg leading-8 sm:text-xl">
              Create or discover small, course-specific study sessions happening
              soon—so you can stop searching for a group and start making
              progress.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/sessions" className={buttonVariants({ size: "lg" })}>
                Browse sessions
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/signup"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Create an account
              </Link>
            </div>
            <p className="text-muted-foreground mt-5 text-sm">
              For students with a verified{" "}
              <span className="text-foreground font-mono text-xs">
                calpoly.edu
              </span>{" "}
              email.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:mx-0">
            <div
              className="bg-warm/35 absolute -top-6 -right-8 -z-10 size-40 rounded-full blur-3xl"
              aria-hidden="true"
            />
            <Card className="rotate-[1deg] overflow-hidden">
              <div className="border-border bg-muted/55 flex items-center justify-between border-b px-5 py-4">
                <span className="text-muted-foreground font-mono text-xs font-medium tracking-wider uppercase">
                  Session preview
                </span>
                <Badge>Starting soon</Badge>
              </div>
              <CardContent className="p-6 sm:p-7">
                <div className="flex items-start gap-4">
                  <span className="bg-secondary text-primary grid size-12 shrink-0 place-items-center rounded-2xl">
                    <BookOpen className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-primary font-mono text-xs font-semibold tracking-wide uppercase">
                      CSC 202
                    </p>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight">
                      Midterm practice problems
                    </h2>
                  </div>
                </div>
                <dl className="border-border mt-7 grid gap-4 border-t pt-5 text-sm">
                  <div className="flex items-center gap-3">
                    <Clock3
                      className="text-primary size-4"
                      aria-hidden="true"
                    />
                    <dt className="sr-only">Time</dt>
                    <dd>Today, 4:00–5:30 PM</dd>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin
                      className="text-primary size-4"
                      aria-hidden="true"
                    />
                    <dt className="sr-only">Location</dt>
                    <dd>Kennedy Library · Focused</dd>
                  </div>
                  <div className="flex items-center gap-3">
                    <UsersRound
                      className="text-primary size-4"
                      aria-hidden="true"
                    />
                    <dt className="sr-only">Capacity</dt>
                    <dd>3 of 5 seats filled</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            <div className="border-border bg-card absolute -bottom-5 -left-3 flex -rotate-2 items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold shadow-lg sm:-left-8">
              <span
                className="bg-primary size-2 rounded-full"
                aria-hidden="true"
              />
              Small groups. Clear plans.
            </div>
          </div>
        </div>
      </section>

      <section
        className="page-container py-18 sm:py-24"
        aria-labelledby="how-it-works"
      >
        <div className="max-w-xl">
          <p className="text-primary font-mono text-xs font-semibold tracking-[0.16em] uppercase">
            How it works
          </p>
          <h2
            id="how-it-works"
            className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl"
          >
            From “I should study” to a real plan.
          </h2>
        </div>
        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map((step) => (
            <li
              key={step.number}
              className="border-border bg-card rounded-2xl border p-6"
            >
              <span className="text-primary font-mono text-xs font-semibold">
                {step.number}
              </span>
              <h3 className="mt-8 text-lg font-semibold tracking-tight">
                {step.title}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-border bg-secondary/45 border-y">
        <div className="page-container grid gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-primary font-mono text-xs font-semibold tracking-[0.16em] uppercase">
              Useful from day one
            </p>
            <h2 className="mt-3 max-w-lg text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              Share a session wherever your class already talks.
            </h2>
          </div>
          <div className="text-muted-foreground space-y-4 text-base leading-7">
            <p>
              Public sessions can be discovered by anyone browsing StudyDrop.
              Unlisted sessions stay out of browse and open through a shared
              link.
            </p>
            <p className="text-foreground flex items-start gap-3">
              <Link2
                className="text-primary mt-1 size-5 shrink-0"
                aria-hidden="true"
              />
              Send an unlisted link to your existing class chat or directly to
              classmates.
            </p>
          </div>
        </div>
      </section>

      <section className="page-container py-16 sm:py-24">
        <div className="bg-primary text-primary-foreground overflow-hidden rounded-[2rem] px-6 py-12 text-center sm:px-12 sm:py-16">
          <p className="text-primary-foreground/75 font-mono text-xs font-semibold tracking-[0.16em] uppercase">
            Make the next hour count
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.045em] sm:text-5xl">
            Find a session that fits what you need now.
          </h2>
          <Link
            href="/sessions"
            className={cn(
              buttonVariants({ variant: "secondary", size: "lg" }),
              "bg-primary-foreground text-primary hover:bg-primary-foreground/90 mt-8",
            )}
          >
            Browse upcoming sessions
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
