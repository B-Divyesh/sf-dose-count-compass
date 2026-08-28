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
