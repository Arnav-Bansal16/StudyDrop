import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test("landing page exposes metadata and primary routes", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/StudyDrop — Study sessions happening soon/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    /course-specific study sessions happening soon/,
  );
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Study better",
  );

  const main = page.getByRole("main");
  await expect(
    main.getByRole("link", { name: "Browse sessions" }).first(),
  ).toHaveAttribute("href", "/sessions");
  await expect(
    main.getByRole("link", { name: "Create an account" }),
  ).toHaveAttribute("href", "/signup");
  await expect(
    page.getByRole("navigation", { name: "Primary navigation" }),
  ).toContainText("Log in");
});

test("demo auth protects dashboard and exposes the auth forms", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/);

  await expect(
    page.getByRole("heading", { name: "Log in to StudyDrop" }),
  ).toBeVisible();
  await expect(
    page.getByText("Demo mode: no real account or email is created."),
  ).toBeVisible();

  await page.goto("/signup");
  await expect(
    page.getByRole("heading", { name: "Create your StudyDrop account" }),
  ).toBeVisible();
  await expect(
    page.getByText("Demo mode: no real account or email is created."),
  ).toBeVisible();
});

test("unknown routes render the branded not-found surface", async ({
  page,
}) => {
  const response = await page.goto("/this-page-does-not-exist");

  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "This page isn’t here.",
  );
  await expect(
    page.getByRole("link", { name: "Back to home" }),
  ).toHaveAttribute("href", "/");
});

test("unlisted sessions resolve only through their share link", async ({
  page,
}) => {
  await page.goto("/sessions");
  await expect(page.getByText("Homework 6 problem walkthrough")).toHaveCount(0);

  await page.goto("/s/21111111-1111-4111-8111-111111111104");
  await expect(
    page.getByRole("heading", { name: "Homework 6 problem walkthrough" }),
  ).toBeVisible();
  await expect(page.getByText("Unlisted link", { exact: true })).toBeVisible();

  const response = await page.goto(
    "/sessions/11111111-1111-4111-8111-111111111104",
  );
  expect(response?.status()).toBe(404);
});

test("demo auth validation, persistence, logout, and mobile layout work", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();

  for (const path of ["/", "/sessions", "/signup"]) {
    await page.goto(path);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(390);
  }

  await page.goto("/signup");
  await page.getByLabel("Display name").fill("Mobile Demo");
  await page.getByLabel("Email address").fill("student@gmail.com");
  await page.getByLabel("Password", { exact: true }).fill("password123");
  await page.getByLabel("Confirm password").fill("password123");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(
    page.getByText("Only calpoly.edu addresses can sign up."),
  ).toBeVisible();

  await page.goto("/signup");
  await page.getByLabel("Display name").fill("Mobile Demo");
  await page.getByLabel("Email address").fill("student@calpoly.edu");
  await page.getByLabel("Password", { exact: true }).fill("password123");
  await page.getByLabel("Confirm password").fill("password123");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL("/");
  await context.close();
});

test("two demo users can create, join, leave, and cancel a session", async ({
  browser,
}) => {
  test.setTimeout(90_000);
  const hostContext = await browser.newContext();
  const guestContext = await browser.newContext();
  const host = await hostContext.newPage();
  const guest = await guestContext.newPage();

  await hostContext.addCookies([
    {
      name: "studydrop-demo-user",
      value: encodeURIComponent(
        JSON.stringify({ displayName: "Demo Host", email: "host@calpoly.edu" }),
      ),
      url: "http://127.0.0.1:3000",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  await guestContext.addCookies([
    {
      name: "studydrop-demo-user",
      value: encodeURIComponent(
        JSON.stringify({
          displayName: "Demo Guest",
          email: "guest@calpoly.edu",
        }),
      ),
      url: "http://127.0.0.1:3000",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  await host.goto("/sessions/new");
  await host
    .getByLabel("Course")
    .selectOption({ label: "CSC 101 · Fundamentals of Computer Science" });
  await host.getByLabel("Topic").fill("Two user demo review");
  await host.getByLabel("Location or link").fill("Demo room");
  await host.getByRole("button", { name: "Create session" }).click();
  await host.waitForURL(/\/sessions\/[0-9a-f-]{36}$/, { timeout: 20_000 });
  const sessionUrl = host.url();
  await host.goto("/dashboard?view=hosted");
  await expect(
    host.getByRole("heading", { name: "Hosted sessions" }),
  ).toBeVisible();
  await expect(
    host.getByRole("link", { name: "Open session details" }),
  ).toHaveAttribute("href", new URL(sessionUrl).pathname);

  const sessionPath = new URL(sessionUrl).pathname;
  await guest.goto(sessionPath);
  await expect(guest).toHaveURL(sessionUrl);
  await guest.getByRole("button", { name: "Join session" }).click();
  await expect(
    guest.getByRole("button", { name: "Leave session" }),
  ).toBeVisible({ timeout: 20_000 });
  await guest.goto("/dashboard?view=joined");
  await expect(
    guest.getByRole("heading", { name: "Joined sessions" }),
  ).toBeVisible();
  await expect(
    guest.getByRole("link", { name: "Open session details" }),
  ).toHaveAttribute("href", sessionPath);
  await expect(guest.getByText("2 of 4 seats filled")).toBeVisible();
  await guest.goto(sessionPath);
  await guest.getByRole("button", { name: "Leave session" }).click();
  await expect(guest.getByRole("button", { name: "Join session" })).toBeVisible(
    { timeout: 20_000 },
  );
  await guest.goto("/dashboard?view=joined");
  await expect(
    guest.getByRole("heading", { name: "No active joined sessions" }),
  ).toBeVisible();

  await host.goto(sessionPath);
  await host.getByRole("button", { name: "Cancel session" }).click();
  await host.getByRole("button", { name: "Confirm cancellation" }).click();
  await expect(
    host.getByText("Cancelled", { exact: true }).first(),
  ).toBeVisible();
  await host.goto("/dashboard?view=past");
  await expect(
    host.getByRole("heading", { name: "Past sessions" }),
  ).toBeVisible();
  await expect(host.getByText("Cancelled", { exact: true })).toBeVisible();
  await guestContext.close();
  await hostContext.close();
});
