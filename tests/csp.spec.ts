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
    "default-src 'self'; connect-src 'self' https://api.sociobot.in; img-src 'self' data:; style-src 'self'; script-src 'self'; base-uri 'self'; form-action 'self'",
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
