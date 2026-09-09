import { describe, expect, it } from "vitest";

import { buildSafeNextPath, signupSchema } from "@/lib/validation/auth";

describe("calpoly auth validation", () => {
  it("accepts a valid calpoly.edu signup payload", () => {
    const result = signupSchema.safeParse({
      displayName: "Jordan Lee",
      email: "Jordan@CALPOLY.EDU",
      password: "password123",
      confirmPassword: "password123",
    });

    expect(result.success).toBe(true);
  });

  it("rejects non-calpoly domains and mismatched passwords", () => {
    const invalidDomain = signupSchema.safeParse({
      displayName: "Jordan Lee",
      email: "jordan@gmail.com",
      password: "password123",
      confirmPassword: "password123",
    });

    const mismatchedPasswords = signupSchema.safeParse({
      displayName: "Jordan Lee",
      email: "jordan@calpoly.edu",
      password: "password123",
      confirmPassword: "password456",
    });

    expect(invalidDomain.success).toBe(false);
    expect(mismatchedPasswords.success).toBe(false);
  });

  it("blocks open redirects but preserves valid relative paths", () => {
    expect(buildSafeNextPath("/dashboard")).toBe("/dashboard");
    expect(buildSafeNextPath("https://evil.example.com")).toBe("/dashboard");
    expect(buildSafeNextPath("/sessions/new")).toBe("/sessions/new");
  });
});
