"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  buildSafeNextPath,
  flattenZodErrors,
  loginSchema,
  signupSchema,
  type AuthFormState,
} from "@/lib/validation/auth";

const DEMO_AUTH_COOKIE = "studydrop-demo-user";

type DemoUser = {
  displayName: string;
  email: string;
};

function readDemoUser(value: string | undefined): DemoUser | null {
  if (!value) return null;

  try {
    const user = JSON.parse(value) as Partial<DemoUser>;
    if (
      typeof user.displayName === "string" &&
      typeof user.email === "string"
    ) {
      return user as DemoUser;
    }
  } catch {
    return null;
  }

  return null;
}

async function setDemoUser(user: DemoUser) {
  const cookieStore = await cookies();
  cookieStore.set(DEMO_AUTH_COOKIE, JSON.stringify(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function signUpAction(
  _prevState: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse({
    displayName: String(formData.get("displayName") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });

  if (!parsed.success) {
    return { code: "error", fieldErrors: flattenZodErrors(parsed.error) };
  }

  await setDemoUser({
    displayName: parsed.data.displayName,
    email: parsed.data.email,
  });
  redirect("/dashboard");
}

export async function signInAction(
  _prevState: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return { code: "error", fieldErrors: flattenZodErrors(parsed.error) };
  }

  const { email } = parsed.data;
  const safeNext = buildSafeNextPath(String(formData.get("next") ?? "/dashboard"));
  await setDemoUser({ displayName: email.split("@")[0], email });
  redirect(safeNext);
}

export async function signOutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_AUTH_COOKIE);
  redirect("/");
}

export async function getDemoUser(): Promise<DemoUser | null> {
  const cookieStore = await cookies();
  return readDemoUser(cookieStore.get(DEMO_AUTH_COOKIE)?.value);
}

export async function requireAuthenticatedUser(nextPath = "/dashboard") {
  const user = await getDemoUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return user;
}
