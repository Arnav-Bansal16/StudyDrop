import { ArrowLeft, Compass } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="page-container flex min-h-[65svh] items-center justify-center py-16 text-center">
      <div className="max-w-lg">
        <span className="bg-secondary text-primary mx-auto grid size-14 place-items-center rounded-2xl">
          <Compass className="size-6" aria-hidden="true" />
        </span>
        <p className="text-primary mt-6 font-mono text-xs font-semibold tracking-[0.16em] uppercase">
          404 · Lost your study spot?
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
          This page isn’t here.
        </h1>
        <p className="text-muted-foreground mt-4 text-base leading-7">
          The link may be incomplete, or the page may have moved. Head home and
          try another route.
        </p>
        <Link href="/" className={`${buttonVariants()} mt-7`}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to home
        </Link>
      </div>
    </main>
  );
}
