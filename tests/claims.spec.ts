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
  await page.getByRole("button", { name: "Log 1 puff" }).click();
  await expect(page.locator('[data-device="sample-blue"] .count-row strong')).toHaveText("41");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Three devices, counted for you" }),
  ).toBeVisible();
  await expect(page.locator('[data-device="sample-blue"] .count-row strong')).toHaveText("41");
  await context.setOffline(false);
});

test("@claim:csv-export Downloads dose history as a spreadsheet file", async ({ page }) => {
  await page.goto("/demo");
  await page.getByRole("button", { name: "Log 1 puff" }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download dose history" }).click();
  const file = await download;
  const csv = await readFile((await file.path())!, "utf8");
  expect(csv).toContain("record_type,device_id,device,type,total,remaining,threshold,updated,event_at,dose_amount");
  expect(csv.match(/^"device"/gm)).toHaveLength(3);
  expect(csv.match(/^"dose_log"/gm)).toHaveLength(5);
  expect(csv).toContain("Blue rescue inhaler");
});

test("@claim:json-export Downloads a backup file", async ({ page }) => {
  await page.goto("/demo");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download backup file" }).click();
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
  await expect(card.getByText("Blue rescue inhaler")).toBeVisible();
  await expect(card.getByText("Saline spray")).toBeVisible();
  await expect(card.getByText("Travel injector")).toBeVisible();
});

test("@claim:demo-isolation One-click demo stays separate and resets when leaving", async ({ page }) => {
  await page.goto("/log");
  await page.getByRole("button", { name: "Add a device" }).click();
  await page.getByLabel("Name").fill("Private real inhaler");
  await page.getByLabel("Total doses").fill("100");
  await page.getByLabel("Doses left").fill("100");
  await page.getByLabel("Refill reminder count").fill("20");
  await page.getByRole("button", { name: "Save device" }).click();
  await page.getByRole("link", { name: "Dose Count Compass home" }).click();
  await page.getByRole("link", { name: "Try it with sample data" }).click();
  await expect(page.getByText("Demo — sample data, nothing is saved")).toBeVisible();
  await expect(page.getByText("Blue rescue inhaler")).toBeVisible();
  await expect(page.getByText("Saline spray")).toBeVisible();
  await expect(page.getByText("Travel injector")).toBeVisible();
  await expect(page.getByText("Private real inhaler")).toHaveCount(0);
  await page.getByRole("button", { name: "Log 1 puff" }).click();
  await expect(page.locator('[data-device="sample-blue"] .count-row strong')).toHaveText("41");
  await page.getByRole("button", { name: "Start for real" }).click();
  await expect(page.getByText("Private real inhaler")).toBeVisible();
  await page.goto("/?demo=1");
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByText("Blue rescue inhaler")).toBeVisible();
  await expect(page.getByText("Private real inhaler")).toHaveCount(0);
  await expect(page.locator('[data-device="sample-blue"] .count-row strong')).toHaveText("42");
  expect(await page.evaluate(async () => {
    const read = (name: string) => new Promise<Array<{ name: string; remaining: number }>>((resolve, reject) => {
      const request = indexedDB.open(name);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const get = request.result.transaction("state").objectStore("state").get("devices");
        get.onerror = () => reject(get.error);
        get.onsuccess = () => resolve(get.result);
      };
    });
    const [real, sampleData] = await Promise.all([read("real:dose-count-compass"), read("demo:dose-count-compass")]);
    return { real: real.map((device) => device.name), blue: sampleData.find((device) => device.name === "Blue rescue inhaler")?.remaining };
  })).toEqual({ real: ["Private real inhaler"], blue: 42 });
});

test("@claim:local-only Real records stay in browser storage with no cross-origin requests", async ({
  page,
}) => {
  const crossOrigin: string[] = [];
  page.on("request", (request) => {
    if (!request.url().startsWith("http://127.0.0.1:4173"))
      crossOrigin.push(request.url());
  });
  await page.goto("/log");
  await page.getByRole("button", { name: "Add a device" }).click();
  await page.getByLabel("Name").fill("Browser-only inhaler");
  await page.getByLabel("Total doses").fill("60");
  await page.getByLabel("Doses left").fill("60");
  await page.getByLabel("Refill reminder count").fill("12");
  await page.getByRole("button", { name: "Save device" }).click();
  await expect(page.getByText("Browser-only inhaler")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Browser-only inhaler")).toBeVisible();
  expect(await page.evaluate(async () => new Promise<boolean>((resolve, reject) => {
    const request = indexedDB.open("real:dose-count-compass");
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const get = request.result.transaction("state").objectStore("state").get("devices");
      get.onerror = () => reject(get.error);
      get.onsuccess = () => resolve(Array.isArray(get.result) && get.result.some((device: { name: string }) => device.name === "Browser-only inhaler"));
    };
  }))).toBe(true);
  expect(crossOrigin).toEqual([]);
});

test("@claim:log-updates-count Repeated logs count a device down to zero", async ({ page }) => {
  await page.goto("/demo");
  await expect(page.locator('[data-device="sample-blue"] .count-row strong')).toHaveText("42");
  for (let remaining = 41; remaining >= 0; remaining--) {
    await page.locator('[data-device="sample-blue"] [data-action="dose"]').click();
    await expect(page.locator('[data-device="sample-blue"] .count-row strong')).toHaveText(String(remaining));
  }
  await expect(page.locator('[data-device="sample-blue"] [data-action="dose"]')).toBeDisabled();
  await expect(page.locator('[data-device="sample-blue"] .status')).toHaveText("Empty — refill now");
  expect(await page.evaluate(async () => new Promise<boolean>((resolve, reject) => {
    const request = indexedDB.open("demo:dose-count-compass");
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const get = request.result.transaction("state").objectStore("state").get("devices");
      get.onerror = () => reject(get.error);
      get.onsuccess = () => {
        const blue = get.result.find((device: { id: string }) => device.id === "sample-blue");
        resolve(blue?.remaining === 0 && blue.logs?.length === 44);
      };
    };
  }))).toBe(true);
});

test("@claim:refill-reminder The refill reminder starts at the chosen count", async ({ page }) => {
  await page.goto("/demo");
  const card = page.locator('[data-device="sample-blue"]');
  await expect(card.locator(".status")).toHaveText("Enough for now");
  for (let index = 0; index < 12; index++) await card.locator('[data-action="dose"]').click();
  await expect(card.locator(".count-row strong")).toHaveText("30");
  await expect(card.locator(".status")).toHaveText("Refill reminder");
  await card.locator('[data-action="dose"]').click();
  await expect(card.locator(".count-row strong")).toHaveText("29");
  await expect(card.locator(".status")).toHaveText("Refill reminder");
});

test("@claim:free-to-use Core use has no purchase gate", async ({ page }) => {
  const billingRequests: string[] = [];
  page.on("request", (request) => { if (/checkout|billing|license|payment/i.test(request.url())) billingRequests.push(request.url()); });
  await page.goto("/");
  await expect(page.getByText("Free to use")).toBeVisible();
  await expect(page.getByText(/buy|price|paid|purchase/i)).toHaveCount(0);
  await page.getByRole("link", { name: "My devices" }).click();
  await page.getByRole("button", { name: "Add a device" }).click();
  await page.getByLabel("Name").fill("Free-use inhaler");
  await page.getByLabel("Total doses").fill("2");
  await page.getByLabel("Doses left").fill("2");
  await page.getByLabel("Refill reminder count").fill("1");
  await page.getByRole("button", { name: "Save device" }).click();
  await page.getByRole("button", { name: "Log 1 puff" }).click();
  await expect(page.getByText("Free-use inhaler")).toBeVisible();
  expect(billingRequests).toEqual([]);
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
  await page.getByLabel("Refill reminder count").fill("20");
  await page.getByRole("button", { name: "Save device" }).click();
  await expect(page.getByText("Pocket inhaler")).toBeVisible();
});

test("refill reminder cannot exceed a device total", async ({ page }) => {
  await page.goto("/log");
  await page.getByRole("button", { name: "Add a device" }).click();
  await page.getByLabel("Name").fill("Boundary device");
  await page.getByLabel("Total doses").fill("2");
  await page.getByLabel("Doses left").fill("2");
  await page.getByLabel("Refill reminder count").fill("999");
  await page.getByRole("button", { name: "Save device" }).click();
  await expect(page.getByText("refill reminder no higher than total")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Add a device" })).toBeVisible();
});

test("the unsupported paid offer is absent", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Compass Plus")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Buy Compass Plus/i })).toHaveCount(0);
});

test("direct demo query enters the seeded dashboard", async ({ page }) => {
  await page.goto("/?demo=1");
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByRole("heading", { name: "Three devices, counted for you" })).toBeVisible();
  await expect(page.getByText("Blue rescue inhaler")).toBeVisible();
});

test("route navigation updates focus, announcement, canonical, and social metadata", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Demo" }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.getByRole("heading", { name: "Three devices, counted for you" })).toBeFocused();
  await expect(page.locator(".route-announcer")).toHaveText("Now viewing: Three devices, counted for you");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://dose-count-compass.sociobot.in/demo");
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", "https://dose-count-compass.sociobot.in/demo");
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute("content", "Demo — Dose Count Compass");
  await page.getByRole("link", { name: "My devices" }).click();
  await page.goBack();
  await expect(page.getByRole("heading", { name: "Three devices, counted for you" })).toBeFocused();
  await expect(page.locator(".route-announcer")).toHaveText("Now viewing: Three devices, counted for you");
});

test("dashboard heading outlines are sequential when empty and populated", async ({ page }) => {
  for (const path of ["/log", "/demo"]) {
    await page.goto(path);
    const levels = await page.locator("main h1, main h2, main h3, main h4, main h5, main h6").evaluateAll((headings) => headings.map((heading) => Number(heading.tagName.slice(1))));
    expect(levels[0]).toBe(1);
    for (let index = 1; index < levels.length; index++) expect(levels[index]).toBeLessThanOrEqual(levels[index - 1] + 1);
    await expect(page.getByRole("heading", { name: "Tracked devices", level: 2 })).toBeVisible();
  }
});

test("@claim:backup-import Import validates, confirms replacement, and supports Undo", async ({ page }) => {
  await page.goto("/log");
  await page.getByRole("button", { name: "Add a device" }).click();
  await page.getByLabel("Name").fill("Keep me");
  await page.getByLabel("Total doses").fill("10");
  await page.getByLabel("Doses left").fill("10");
  await page.getByLabel("Refill reminder count").fill("2");
  await page.getByRole("button", { name: "Save device" }).click();
  const importer = page.getByLabel("Import backup file");
  await importer.setInputFiles({ name: "invalid.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify({ version: 1, devices: [{ total: 0, remaining: -5, threshold: -10, logs: "not-a-list" }] })) });
  await expect(page.getByRole("heading", { name: "Replace this device list?" })).toHaveCount(0);
  await expect(page.getByText("Keep me")).toBeVisible();
  const replacement = { version: 1, devices: [{ id: "replacement", name: "Replacement only", kind: "Inhaler", total: 60, remaining: 60, threshold: 12, notes: "", updated: "2026-08-28T00:00:00.000Z", logs: [] }] };
  await importer.setInputFiles({ name: "valid.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(replacement)) });
  await expect(page.getByRole("heading", { name: "Replace this device list?" })).toBeVisible();
  await expect(page.getByText("Keep me")).toBeVisible();
  await page.getByRole("button", { name: "Replace with backup" }).click();
  await expect(page.getByText("Replacement only")).toBeVisible();
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByText("Keep me")).toBeVisible();
});

test("deleting a device is confirmed and can be undone", async ({ page }) => {
  await page.goto("/demo");
  await page.getByRole("button", { name: "Edit" }).first().click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete device" }).click();
  await expect(page.getByRole("heading", { name: "Blue rescue inhaler" })).toHaveCount(0);
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByRole("heading", { name: "Blue rescue inhaler" })).toBeVisible();
});

test("keyboard order, dialog return focus, file focus, and 200% reflow are usable", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Count doses before you run out" })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip")).toBeFocused();
  await page.goto("/log");
  await page.getByRole("button", { name: "Add a device" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Add a device" })).toBeFocused();
  const importer = page.getByLabel("Import backup file");
  await importer.focus();
  await expect(page.locator(".file-label")).toHaveCSS("outline-style", "solid");
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("390px mobile has no horizontal overflow and all visible controls meet target size", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto("/demo");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const undersized = await page.locator("button, a, input[type=file]").evaluateAll((nodes) => nodes.filter((node) => {
    if (!(node as HTMLElement).offsetParent) return false;
    const rect = (node as HTMLElement).getBoundingClientRect();
    return rect.width < 44 || rect.height < 44;
  }).map((node) => (node as HTMLElement).getAttribute("aria-label") || (node as HTMLElement).textContent?.trim()));
  expect(undersized).toEqual([]);
  await context.close();
});

test("has no serious or critical accessibility findings", async ({
  browser,
}) => {
  for (const colorScheme of ["light", "dark"] as const) {
    const context = await browser.newContext({ bypassCSP: true, colorScheme });
    const page = await context.newPage();
    for (const path of ["/", "/demo", "/log", "/privacy", "/terms", "/not-a-real-page"]) {
      await page.goto(path);
      await page.addScriptTag({ content: axe.source });
      const result = await page.evaluate(async () =>
        (window as typeof window & { axe: typeof axe }).axe.run(),
      );
      expect(result.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""))).toEqual([]);
    }
    await context.close();
  }
});
