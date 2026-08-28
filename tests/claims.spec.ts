import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import axe from "axe-core";

test("@claim:offline-reload Works offline after the first visit", async ({
  page,
  context,
}) => {
  await page.goto("/demo");
  await page.waitForFunction(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Three devices, counted for you" }),
  ).toBeVisible();
  await context.setOffline(false);
});

test("@claim:csv-export Exports the log as CSV", async ({ page }) => {
  await page.goto("/demo");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV" }).click();
  const file = await download;
  expect(await readFile((await file.path())!, "utf8")).toContain(
    "device,type,total,remaining,threshold,updated",
  );
});

test("@claim:json-export Exports a JSON backup", async ({ page }) => {
  await page.goto("/demo");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export backup" }).click();
  const file = await download;
  expect(
    JSON.parse(await readFile((await file.path())!, "utf8")).devices,
  ).toHaveLength(3);
});

test("@claim:print-card Opens a printable inventory card", async ({ page }) => {
  await page.goto("/demo");
  const popup = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Print inventory card" }).click();
  const card = await popup;
  await expect(
    card.getByRole("heading", { name: "Dose Count Compass inventory" }),
  ).toBeVisible();
});

test("@claim:local-only Demo tracking makes no cross-origin requests", async ({
  page,
}) => {
  const crossOrigin: string[] = [];
  page.on("request", (request) => {
    if (!request.url().startsWith("http://127.0.0.1:4173"))
      crossOrigin.push(request.url());
  });
  await page.goto("/demo");
  await page.getByRole("button", { name: "Log 1 puff" }).click();
  expect(crossOrigin).toEqual([]);
});

test("keyboard users can add a device", async ({ page }) => {
  await page.goto("/log");
  await page.getByRole("button", { name: "Add a device" }).press("Enter");
  await expect(
    page.getByRole("heading", { name: "Add a device" }),
  ).toBeVisible();
  await page.getByLabel("Name").fill("Pocket inhaler");
  await page.getByLabel("Total doses").fill("120");
  await page.getByLabel("Doses left").fill("120");
  await page.getByLabel("Refill threshold").fill("20");
  await page.getByRole("button", { name: "Save device" }).click();
  await expect(page.getByText("Pocket inhaler")).toBeVisible();
});

test("has no serious or critical accessibility findings", async ({
  browser,
}) => {
  for (const colorScheme of ["light", "dark"] as const) {
    const context = await browser.newContext({ bypassCSP: true, colorScheme });
    const page = await context.newPage();
    await page.goto("/demo");
    await page.addScriptTag({ content: axe.source });
    const result = await page.evaluate(async () =>
      (window as typeof window & { axe: typeof axe }).axe.run(),
    );
    expect(
      result.violations.filter((v) =>
        ["serious", "critical"].includes(v.impact ?? ""),
      ),
    ).toEqual([]);
    await context.close();
  }
});
