import Link from "next/link";

import { Brand } from "@/components/site/brand";

export function SiteFooter() {
  return (
    <footer className="border-border bg-foreground text-background border-t">
      <div className="page-container flex flex-col gap-8 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-md space-y-3">
          <Brand inverse />
          <p className="text-background/70 text-sm leading-6">
            Small, course-specific study sessions for Cal Poly students.
          </p>
        </div>
        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap gap-x-6 gap-y-3 text-sm"
        >
          <Link
            className="text-background/75 hover:text-background rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4"
            href="/sessions"
          >
            Browse
          </Link>
          <Link
            className="text-background/75 hover:text-background rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4"
            href="/login"
          >
            Log in
          </Link>
          <Link
            className="text-background/75 hover:text-background rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4"
            href="/signup"
          >
            Sign up
          </Link>
        </nav>
      </div>
    </footer>
  );
}
