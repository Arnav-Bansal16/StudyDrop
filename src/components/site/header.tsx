import { Menu } from "lucide-react";
import Link from "next/link";

import { Brand } from "@/components/site/brand";
import { buttonVariants } from "@/components/ui/button";
import { signOutAction } from "@/lib/auth";
import { getDemoUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/sessions", label: "Browse sessions" },
  { href: "/login", label: "Log in" },
];

export async function SiteHeader() {
  const user = await getDemoUser();
  const isAuthenticated = Boolean(user);

  return (
    <header className="border-border/75 bg-background/95 supports-[backdrop-filter]:bg-background/85 sticky top-0 z-40 border-b backdrop-blur">
      <div className="page-container flex h-18 items-center justify-between gap-4">
        <Brand />

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-1 md:flex"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "min-h-10",
              )}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Dashboard
              </Link>
              <form action={signOutAction}>
                <button type="submit" className={buttonVariants({ size: "sm" })}>
                  Log out
                </button>
              </form>
            </>
          ) : (
            <Link href="/signup" className={buttonVariants({ size: "sm" })}>
              Sign up
            </Link>
          )}
        </nav>

        <details className="group relative md:hidden">
          <summary className="border-border bg-background text-foreground hover:bg-accent focus-visible:ring-ring flex size-11 cursor-pointer list-none items-center justify-center rounded-full border transition-colors outline-none marker:hidden focus-visible:ring-2 focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
            <Menu className="size-5" aria-hidden="true" />
            <span className="sr-only">Open navigation</span>
          </summary>
          <nav
            aria-label="Mobile navigation"
            className="border-border bg-card absolute top-13 right-0 flex w-64 flex-col gap-1 rounded-2xl border p-2 shadow-xl"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "w-full justify-start rounded-xl",
                )}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className={buttonVariants({ variant: "ghost" })}>
                  Dashboard
                </Link>
                <form action={signOutAction} className="w-full">
                  <button type="submit" className={cn(buttonVariants(), "mt-1 w-full rounded-xl")}>
                    Log out
                  </button>
                </form>
              </>
            ) : (
              <Link href="/signup" className={cn(buttonVariants(), "mt-1 w-full rounded-xl")}>
                Sign up
              </Link>
            )}
          </nav>
        </details>
      </div>
    </header>
  );
}
