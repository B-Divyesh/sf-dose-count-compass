import { expect, test } from "@playwright/test";

test("production build has no CSP console errors or inline styles", async ({
  page,
}) => {
  const cspErrors: string[] = [];
  const watch = (message: { type(): string; text(): string }) => {
    if (
      message.type() === "error" &&
      /content security policy|style-src/i.test(message.text())
    ) {
      cspErrors.push(message.text());
    }
  };
  page.on("console", watch);
  page.context().on("page", (openedPage) => openedPage.on("console", watch));

  const response = await page.goto("/demo", { waitUntil: "networkidle" });
  expect(response?.headers()["content-security-policy"]).toBe(
    "default-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
  );
  await expect(page.locator("[style]")).toHaveCount(0);

  await page.getByRole("button", { name: "Log 1 puff" }).click();
  await page.getByRole("button", { name: "Edit" }).first().click();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.locator("[style]")).toHaveCount(0);

  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Print inventory card" }).click();
  const popup = await popupPromise;
  await popup.waitForLoadState("networkidle");
  await expect(popup.locator("style, [style]")).toHaveCount(0);
  expect(
    await popup.evaluate(() =>
      Array.from(document.styleSheets, (sheet) => sheet.href),
    ),
  ).toEqual(["http://127.0.0.1:4173/print.css"]);

  expect(cspErrors).toEqual([]);
});

test("production routes return a real missing-page response and secure cache headers", async ({ request }) => {
  const missing = await request.get("/not-a-real-page");
  expect(missing.status()).toBe(404);
  expect(await missing.text()).toContain("This shelf is empty");
  expect(missing.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(missing.headers()["permissions-policy"]).toContain("camera=()");
  const home = await request.get("/");
  const asset = /assets\/(index-[\w-]+\.js)/.exec(await home.text())?.[1];
  expect(asset).toBeTruthy();
  const script = await request.get(`/assets/${asset}`);
  expect(script.headers()["cache-control"]).toBe("public, max-age=31536000, immutable");
});

test("controlled PWA returns a styled 404 online and offline without resource errors", async ({ page, context }) => {
  const failures: string[] = [];
  const consoleErrors: string[] = [];
  page.on("requestfailed", (request) => failures.push(`${request.url()}: ${request.failure()?.errorText}`));
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  await page.goto("/demo");
  await page.waitForFunction(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));

  const online = await page.goto("/controlled-missing-page");
  expect(online?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "This shelf is empty" })).toBeVisible();
  await expect(page.locator('link[rel="stylesheet"]')).toHaveAttribute("href", "/404.css");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /requested Dose Count Compass page/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://dose-count-compass.sociobot.in/404.html");
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute("href", "/icon-180.svg");
  await expect(page.getByRole("navigation").getByRole("link", { name: "Privacy" })).toBeVisible();
  await expect(page.getByRole("contentinfo").getByRole("link", { name: "Terms" })).toBeVisible();
  expect(await page.getByRole("link", { name: "Go to Dose Count Compass" }).evaluate((node) => getComputedStyle(node).display)).toBe("inline-flex");

  await context.setOffline(true);
  const offline = await page.goto("/offline-missing-page");
  expect(offline?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "This shelf is empty" })).toBeVisible();
  expect(await page.getByRole("heading", { name: "This shelf is empty" }).evaluate((node) => getComputedStyle(node).fontFamily)).toContain("Georgia");
  await context.setOffline(false);
  expect(failures).toEqual([]);
  expect(consoleErrors.filter((message) => /404\.css|ERR_FAILED|stylesheet/i.test(message))).toEqual([]);
});
