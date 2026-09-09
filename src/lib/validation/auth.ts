import { z } from "zod";

export const CALPOLY_DOMAIN = "calpoly.edu";

export function normalizeDisplayName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function buildSafeNextPath(
  input: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!input) return fallback;

  if (
    input.startsWith("//") ||
    input.startsWith("\\") ||
    input.includes("\u0000") ||
    input.startsWith("http://") ||
    input.startsWith("https://")
  ) {
    return fallback;
  }

  const nextPath = input.startsWith("/") ? input : `/${input}`;

  return nextPath.length > 0 ? nextPath : fallback;
}

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .transform(normalizeEmail)
    .pipe(
      z
        .string()
        .email({ message: "Enter a valid email address." })
        .refine((email) => {
          const [, domain] = email.split("@");
          return domain === CALPOLY_DOMAIN;
        }, "Use your exact calpoly.edu email address."),
    ),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const signupSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .transform(normalizeDisplayName)
      .pipe(
        z
          .string()
          .min(2, "Display name must be at least 2 characters.")
          .max(50, "Display name must be 50 characters or fewer."),
      ),
    email: z
      .string()
      .trim()
      .transform(normalizeEmail)
      .pipe(
        z
          .string()
          .email({ message: "Enter a valid Cal Poly email address." })
          .refine((email) => {
            const [, domain] = email.split("@");
            return domain === CALPOLY_DOMAIN;
          }, "Only calpoly.edu addresses can sign up."),
      ),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type AuthFormState = {
  code?: "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export function flattenZodErrors(error: z.ZodError): Record<string, string> {
  return error.flatten().fieldErrors as Record<string, string>;
}
