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

  await expect(page.getByRole("heading", { name: "Log in to StudyDrop" })).toBeVisible();
  await expect(page.getByText("Demo mode: no real account or email is created.")).toBeVisible();

  await page.goto("/signup");
  await expect(page.getByRole("heading", { name: "Create your StudyDrop account" })).toBeVisible();
  await expect(page.getByText("Demo mode: no real account or email is created.")).toBeVisible();
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

test("two demo users can create, join, leave, and cancel a session", async ({
  browser,
}) => {
  test.setTimeout(90_000);
  const hostContext = await browser.newContext();
  const guestContext = await browser.newContext();
  const host = await hostContext.newPage();
  const guest = await guestContext.newPage();

  await hostContext.addCookies([
    { name: "studydrop-demo-user", value: encodeURIComponent(JSON.stringify({ displayName: "Demo Host", email: "host@calpoly.edu" })), url: "http://127.0.0.1:3000", httpOnly: true, sameSite: "Lax" },
  ]);
  await guestContext.addCookies([
    { name: "studydrop-demo-user", value: encodeURIComponent(JSON.stringify({ displayName: "Demo Guest", email: "guest@calpoly.edu" })), url: "http://127.0.0.1:3000", httpOnly: true, sameSite: "Lax" },
  ]);
  await host.goto("/sessions/new");
  await host.getByLabel("Course").selectOption({ label: "CSC 101 · Fundamentals of Computer Science" });
  await host.getByLabel("Topic").fill("Two user demo review");
  await host.getByLabel("Location or link").fill("Demo room");
  await host.getByRole("button", { name: "Create session" }).click();
  await host.waitForURL(/\/sessions\/[0-9a-f-]{36}$/, { timeout: 20_000 });
  const sessionUrl = host.url();

  const sessionPath = new URL(sessionUrl).pathname;
  await guest.goto(sessionPath);
  await expect(guest).toHaveURL(sessionUrl);
  await guest.getByRole("button", { name: "Join session" }).click();
  await expect(guest.getByRole("button", { name: "Leave session" })).toBeVisible({ timeout: 20_000 });
  await guest.getByRole("button", { name: "Leave session" }).click();
  await expect(guest.getByRole("button", { name: "Join session" })).toBeVisible({ timeout: 20_000 });

  await host.getByRole("button", { name: "Cancel session" }).click();
  await expect(host.getByText("Cancelled", { exact: true }).first()).toBeVisible();
  await guestContext.close();
  await hostContext.close();
});
