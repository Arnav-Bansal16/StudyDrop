import { ArrowLeft, Construction } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type RouteShellProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function RouteShell({ eyebrow, title, description }: RouteShellProps) {
  return (
    <main className="page-container flex min-h-[calc(100svh-4.5rem)] items-center justify-center py-16 sm:py-24">
      <Card className="w-full max-w-2xl overflow-hidden">
        <CardHeader className="border-border bg-muted/45 border-b p-7 sm:p-9">
          <Badge className="w-fit gap-1.5">
            <Construction className="size-3.5" aria-hidden="true" />
            {eyebrow}
          </Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
            {title}
          </h1>
        </CardHeader>
        <CardContent className="space-y-6 p-7 sm:p-9">
          <p className="text-muted-foreground max-w-xl text-base leading-7 sm:text-lg">
            {description}
          </p>
          <p className="border-border bg-muted/50 text-muted-foreground rounded-xl border p-4 text-sm leading-6">
            This route is part of the application foundation. Its product
            behavior will be added in a later MVP phase.
          </p>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to home
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
