import { expect, test } from "@playwright/test";

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
