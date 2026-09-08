import Link from "next/link";

import { cn } from "@/lib/utils";

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link
      href="/"
      className={cn(
        "group focus-visible:ring-ring inline-flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        inverse && "focus-visible:ring-offset-foreground",
      )}
      aria-label="StudyDrop home"
    >
      <span
        aria-hidden="true"
        className={cn(
          "bg-primary text-primary-foreground grid size-9 place-items-center rounded-xl shadow-sm transition-transform group-hover:-rotate-3",
          inverse && "bg-primary-foreground text-primary",
        )}
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none">
          <path
            d="M12 3.25 4.5 7.5 12 11.75l7.5-4.25L12 3.25Z"
            fill="currentColor"
          />
          <path
            d="M7 10.1v4.15c0 1.55 2.2 2.8 5 2.8s5-1.25 5-2.8V10.1"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M19.5 8v5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="text-lg font-semibold tracking-[-0.035em]">
        StudyDrop
      </span>
    </Link>
  );
}
