import type { DemoUser } from "@/lib/auth";

export function getDemoUserId(user: DemoUser): string {
  return `demo:${user.email}`;
}
