import { expect, test } from "@playwright/test";

test("home page presents the product and primary calls to action", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Heartly/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /create/i }).first()).toBeVisible();
});

test("public marketing pages render", async ({ page }) => {
  for (const path of [
    "/pricing",
    "/how-it-works",
    "/about",
    "/contact",
    "/help",
    "/legal/privacy",
    "/legal/terms",
  ]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBeLessThan(400);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
});

test("template gallery and categories are available", async ({ page }) => {
  await page.goto("/explore");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/say it/i);

  await page.goto("/categories");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    /celebrating/i,
  );
});

test("unknown pages show the branded not-found screen", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByText(/could not find that page|slipped away/i),
  ).toBeVisible();
});

test("auth forms mount without server action errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/register");
  await expect(
    page.getByRole("button", { name: /create my account/i }),
  ).toBeVisible();

  await page.goto("/login");
  await expect(page.getByRole("button", { name: /^log in$/i })).toBeVisible();

  expect(
    errors.filter((error) => /use server|server action|hydration/i.test(error)),
  ).toEqual([]);
});

test("robots and sitemap metadata are served", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBeTruthy();
  expect(await robots.text()).toContain("Sitemap:");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  expect(await sitemap.text()).toContain("/pricing");
});
