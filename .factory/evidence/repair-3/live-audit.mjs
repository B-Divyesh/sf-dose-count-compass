import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium } from "playwright";
import axe from "axe-core";

const origin = "https://dose-count-compass.sociobot.in";
const results = { implementation: "f9e96d315183c516be71d4e2e1e3e982d80621ab" };
const browser = await chromium.launch();

function parseRgb(color) {
  const channels = color.match(/[\d.]+/g)?.slice(0, 3).map(Number);
  assert.equal(channels?.length, 3, `could not parse ${color}`);
  return channels;
}

function luminance(color) {
  return parseRgb(color).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  }).reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
}

function contrast(first, second) {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

async function focusMeasurement(page, indicatorSelector, focusSelector = indicatorSelector) {
  const focusTarget = page.locator(focusSelector).first();
  for (let step = 0; step < 60 && !(await focusTarget.evaluate((node) => document.activeElement === node)); step += 1) {
    await page.keyboard.press("Tab");
  }
  assert.equal(await focusTarget.evaluate((node) => document.activeElement === node), true);
  assert.equal(await focusTarget.evaluate((node) => node.matches(":focus-visible")), true);
  const colors = await page.locator(indicatorSelector).first().evaluate((node) => {
    const style = getComputedStyle(node);
    let ancestor = node.parentElement;
    let background = "";
    while (ancestor) {
      const candidate = getComputedStyle(ancestor).backgroundColor;
      if (candidate !== "transparent" && candidate !== "rgba(0, 0, 0, 0)") {
        background = candidate;
        break;
      }
      ancestor = ancestor.parentElement;
    }
    return { background, outline: style.outlineColor, width: Number.parseFloat(style.outlineWidth), style: style.outlineStyle };
  });
  const ratio = contrast(colors.outline, colors.background);
  assert.equal(colors.style, "solid");
  assert.ok(colors.width >= 2);
  assert.ok(ratio >= 3, `${indicatorSelector} contrast ${ratio}`);
  return { ...colors, ratio: Number(ratio.toFixed(2)) };
}

for (const [name, viewport] of Object.entries({ desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844 } })) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const response = await page.goto(origin, { waitUntil: "networkidle" });
  const firstScreen = await page.evaluate(() => {
    const action = document.querySelector(".hero-actions .primary").getBoundingClientRect();
    const facts = document.querySelector(".facts").getBoundingClientRect();
    return {
      statusText: document.querySelector(".connection").textContent.trim(),
      title: document.title,
      job: document.querySelector("h1").textContent.trim(),
      audience: document.querySelector(".lead").textContent.trim(),
      firstAction: document.querySelector(".hero-actions .primary").textContent.trim(),
      actionResult: document.querySelector(".hero-actions span").textContent.trim(),
      actionBottom: Math.round(action.bottom),
      factsBottom: Math.round(facts.bottom),
      scrollY,
      h1Count: document.querySelectorAll("h1").length,
      hasMain: Boolean(document.querySelector("main")),
      lang: document.documentElement.lang,
      noOverflow: document.documentElement.scrollWidth <= innerWidth,
    };
  });
  assert.equal(response.status(), 200);
  assert.equal(firstScreen.scrollY, 0);
  assert.ok(firstScreen.actionBottom <= viewport.height);
  assert.ok(firstScreen.factsBottom <= viewport.height);
  assert.equal(firstScreen.h1Count, 1);
  assert.equal(firstScreen.hasMain, true);
  assert.equal(firstScreen.noOverflow, true);
  await page.screenshot({ path: `.factory/evidence/repair-3/live-home-${name}.png` });
  results[`${name}FirstScreen`] = firstScreen;
  await context.close();
}

const flowContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const flowPage = await flowContext.newPage();
const errors = [];
const crossOrigin = [];
flowPage.on("pageerror", (error) => errors.push(String(error)));
flowPage.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
flowPage.on("request", (request) => { if (new URL(request.url()).origin !== origin) crossOrigin.push(request.url()); });
await flowPage.goto(`${origin}/log`);
await flowPage.getByRole("button", { name: "Add a device" }).click();
await flowPage.getByLabel("Name").fill("Repair audit spray");
await flowPage.getByLabel("Device type").selectOption("Spray");
await flowPage.getByLabel("Total doses").fill("2");
await flowPage.getByLabel("Doses left").fill("2");
await flowPage.getByLabel("Refill reminder count").fill("1");
await flowPage.getByRole("button", { name: "Save device" }).click();
await flowPage.getByRole("heading", { name: "Repair audit spray" }).waitFor();
await flowPage.reload();
await flowPage.getByRole("button", { name: "Log 1 spray for Repair audit spray" }).click();
await flowPage.locator("[data-device] .status").filter({ hasText: "Refill reminder" }).waitFor();
assert.equal(await flowPage.locator("[data-device] .status").textContent(), "Refill reminder");
await flowPage.getByRole("button", { name: "Log 1 spray for Repair audit spray" }).click();
await flowPage.locator("[data-device] .status").filter({ hasText: "Empty — refill now" }).waitFor();
assert.equal(await flowPage.locator("[data-device] .status").textContent(), "Empty — refill now");
assert.equal(await flowPage.getByRole("button", { name: "Log 1 spray for Repair audit spray" }).isDisabled(), true);
await flowPage.getByRole("button", { name: "Edit Repair audit spray" }).click();
await flowPage.getByLabel("Doses left").fill("3");
await flowPage.getByLabel("Refill reminder count").fill("3");
await flowPage.getByRole("button", { name: "Save device" }).click();
await flowPage.locator(".toast-message").filter({ hasText: "refill reminder no higher than total" }).waitFor();
assert.match(await flowPage.locator(".toast-message").textContent(), /refill reminder no higher than total/);
assert.equal(await flowPage.getByRole("dialog").isVisible(), true);
await flowPage.getByLabel("Doses left").fill("2");
await flowPage.getByLabel("Refill reminder count").fill("1");
await flowPage.getByRole("button", { name: "Save device" }).click();
await flowPage.getByRole("dialog").waitFor({ state: "hidden" });
await flowPage.getByRole("button", { name: "Edit Repair audit spray" }).click();
flowPage.once("dialog", (dialog) => dialog.accept());
await flowPage.getByRole("button", { name: "Delete device" }).click();
await flowPage.getByRole("button", { name: "Undo" }).waitFor();
await flowPage.getByRole("button", { name: "Undo" }).click();
await flowPage.getByRole("link", { name: "Dose Count Compass home" }).click();
await flowPage.getByRole("heading", { name: "Count doses before you run out" }).waitFor();
await flowPage.getByRole("link", { name: "Try it with sample data" }).click();
await flowPage.getByText("Demo — sample data, nothing is saved").waitFor();
const samples = ["Blue rescue inhaler", "Saline spray", "Travel injector"];
for (const sample of samples) assert.equal(await flowPage.getByRole("heading", { name: sample }).isVisible(), true);
assert.equal(await flowPage.getByText("Demo — sample data, nothing is saved").isVisible(), true);
assert.equal(await flowPage.getByText("Repair audit spray").count(), 0);
await flowPage.getByRole("button", { name: "Log 1 puff for Blue rescue inhaler" }).click();
await flowPage.locator('[data-device="sample-blue"] .count-row strong').filter({ hasText: "41" }).waitFor();
assert.equal(await flowPage.locator('[data-device="sample-blue"] .count-row strong').textContent(), "41");
await flowPage.getByRole("button", { name: "Reset demo" }).click();
await flowPage.locator('[data-device="sample-blue"] .count-row strong').filter({ hasText: "42" }).waitFor();
assert.equal(await flowPage.locator('[data-device="sample-blue"] .count-row strong').textContent(), "42");
const backupDownload = flowPage.waitForEvent("download");
await flowPage.getByRole("button", { name: "Download backup file" }).click();
const backup = JSON.parse(await readFile(await (await backupDownload).path(), "utf8"));
assert.equal(backup.devices.length, 3);
const csvDownload = flowPage.waitForEvent("download");
await flowPage.getByRole("button", { name: "Download dose history" }).click();
const csv = await readFile(await (await csvDownload).path(), "utf8");
assert.equal(csv.match(/^"device"/gm)?.length, 3);
assert.equal(csv.match(/^"dose_log"/gm)?.length, 4);
const popupPromise = flowPage.waitForEvent("popup");
await flowPage.getByRole("button", { name: "Print inventory card" }).click();
const popup = await popupPromise;
for (const sample of samples) assert.equal(await popup.getByText(sample).isVisible(), true);
await popup.close();
await flowPage.getByLabel("Import backup file").setInputFiles({ name: "invalid.json", mimeType: "application/json", buffer: Buffer.from('{"version":1,"devices":[{"total":0}]}') });
await flowPage.locator(".toast-message").filter({ hasText: "backup is not valid" }).waitFor();
assert.match(await flowPage.locator(".toast-message").textContent(), /backup is not valid/);
const replacement = { version: 1, devices: [{ id: "audit-replacement", name: "Audit replacement", kind: "Inhaler", total: 10, remaining: 8, threshold: 2, notes: "", updated: "2026-09-06T00:00:00.000Z", logs: [] }] };
await flowPage.getByLabel("Import backup file").setInputFiles({ name: "valid.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(replacement)) });
await flowPage.getByRole("heading", { name: "Replace this device list?" }).waitFor();
assert.equal(await flowPage.getByRole("heading", { name: "Replace this device list?" }).isVisible(), true);
await flowPage.getByRole("button", { name: "Replace with backup" }).click();
await flowPage.getByText("Audit replacement").waitFor();
assert.equal(await flowPage.getByText("Audit replacement").isVisible(), true);
await flowPage.getByRole("button", { name: "Undo" }).click();
await flowPage.getByRole("heading", { name: samples[0] }).waitFor();
for (const sample of samples) assert.equal(await flowPage.getByRole("heading", { name: sample }).isVisible(), true);
await flowPage.getByRole("button", { name: "Start for real" }).click();
await flowPage.getByRole("heading", { name: "Repair audit spray" }).waitFor();
assert.equal(await flowPage.getByRole("heading", { name: "Repair audit spray" }).isVisible(), true);
assert.equal(await flowPage.locator("[data-device] .count-row strong").textContent(), "2");
await flowPage.goto(`${origin}/?demo=1`);
assert.equal(flowPage.url(), `${origin}/demo`);
assert.equal(await flowPage.locator('[data-device="sample-blue"] .count-row strong').textContent(), "42");
assert.equal(await flowPage.getByText("Repair audit spray").count(), 0);
await flowPage.screenshot({ path: ".factory/evidence/repair-3/live-demo-desktop.png" });
results.productFlow = { samples, realCountAfterDemo: 2, resetCount: 42, backupDevices: 3, csvDeviceRows: 3, csvDoseRows: 4, printDevices: 3 };
results.privacy = { crossOriginRequests: crossOrigin, browserErrors: errors };
assert.deepEqual(crossOrigin, []);
assert.deepEqual(errors, []);
await flowContext.close();

const routes = { "/": "Dose Count Compass — Count medicine doses", "/demo": "Demo — Dose Count Compass", "/log": "Dose Count Compass — Track device doses", "/privacy": "Privacy — Dose Count Compass", "/terms": "Terms — Dose Count Compass" };
const routeContext = await browser.newContext();
const routePage = await routeContext.newPage();
results.routes = {};
for (const [path, title] of Object.entries(routes)) {
  const response = await routePage.goto(`${origin}${path}`);
  assert.equal(response.status(), 200);
  await routePage.waitForFunction((expectedTitle) => document.title === expectedTitle, title);
  assert.equal(await routePage.title(), title);
  assert.equal(await routePage.locator("h1").count(), 1);
  assert.equal(await routePage.locator("main").count(), 1);
  results.routes[path] = { status: response.status(), title };
}
await routePage.goto(`${origin}/privacy`);
assert.equal(await routePage.getByRole("link", { name: "Param Factory product listing (external link)" }).getAttribute("href"), "https://hello-factory.sociobot.in/catalog/?q=dose-count-compass");
const missing = await routePage.goto(`${origin}/repair-3-missing`);
assert.equal(missing.status(), 404);
assert.equal(await routePage.getByRole("heading", { name: "Page not found" }).isVisible(), true);
assert.equal(await routePage.getByRole("contentinfo").getByRole("link", { name: "Terms" }).isVisible(), true);
results.missingPage = { status: 404, heading: "Page not found", sharedFooter: true };
await routeContext.close();

results.focus = {};
for (const colorScheme of ["light", "dark"]) {
  const context = await browser.newContext({ colorScheme });
  const page = await context.newPage();
  const values = {};
  await page.goto(origin);
  values.navigation = await focusMeasurement(page, 'header nav a[href="/demo"]');
  await page.goto(`${origin}/demo`);
  values.darkDemoBar = await focusMeasurement(page, '[data-action="reset-demo"]');
  values.normalCard = await focusMeasurement(page, '[data-action="edit"][data-id="sample-blue"]');
  values.lightWarningCard = await focusMeasurement(page, '[data-action="edit"][data-id="sample-injector"]');
  await page.getByRole("button", { name: "Log 1 device for Travel injector" }).click();
  await page.waitForFunction(() => document.querySelector('[data-device="sample-injector"] .status')?.textContent === "Empty — refill now");
  assert.equal(await page.locator('[data-device="sample-injector"] .status').textContent(), "Empty — refill now");
  values.lightEmptyCard = await focusMeasurement(page, '[data-action="edit"][data-id="sample-injector"]');
  await page.getByRole("button", { name: "Edit Blue rescue inhaler" }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete device" }).click();
  values.undoToast = await focusMeasurement(page, ".toast-undo");
  await page.goto(`${origin}/log`);
  await page.getByRole("button", { name: "Add a device" }).click();
  values.formField = await focusMeasurement(page, 'input[name="name"]');
  await page.keyboard.press("Escape");
  values.importControl = await focusMeasurement(page, ".file-label", ".file-label input");
  await page.goto(`${origin}/repair-3-focus-missing`);
  values.missingPage = await focusMeasurement(page, 'header nav a[href="/demo"]');
  results.focus[colorScheme] = values;
  await context.close();
}

const offlineContext = await browser.newContext();
const offlinePage = await offlineContext.newPage();
await offlinePage.goto(`${origin}/demo`);
await offlinePage.waitForFunction(() => navigator.serviceWorker.ready);
await offlinePage.reload();
await offlinePage.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
await offlineContext.setOffline(true);
await offlinePage.getByRole("button", { name: "Log 1 puff for Blue rescue inhaler" }).click();
await offlinePage.waitForFunction(() => document.querySelector('[data-device="sample-blue"] .count-row strong')?.textContent === "41");
await offlinePage.reload();
await offlinePage.waitForFunction(() => document.querySelector('[data-device="sample-blue"] .count-row strong')?.textContent === "41");
assert.equal(await offlinePage.locator('[data-device="sample-blue"] .count-row strong').textContent(), "41");
assert.equal(await offlinePage.locator(".connection").textContent(), "Offline");
await offlineContext.setOffline(false);
const updated = await offlinePage.evaluate(async () => { const registration = await navigator.serviceWorker.ready; await registration.update(); return Boolean(registration.active); });
assert.equal(updated, true);
results.offline = { loggedCountAfterReload: 41, connection: "Offline", updateCheck: "completed" };
await offlineContext.close();

const reducedContext = await browser.newContext({ reducedMotion: "reduce" });
const reducedPage = await reducedContext.newPage();
await reducedPage.goto(origin);
const reducedDuration = await reducedPage.locator(".button.primary").evaluate((node) => getComputedStyle(node).transitionDuration);
assert.ok(Number.parseFloat(reducedDuration) <= 0.001);
results.reducedMotion = reducedDuration;
await reducedContext.close();

const axeContext = await browser.newContext({ bypassCSP: true });
const axePage = await axeContext.newPage();
results.axe = {};
for (const path of [...Object.keys(routes), "/repair-3-axe-missing"]) {
  await axePage.goto(`${origin}${path}`);
  await axePage.addScriptTag({ content: axe.source });
  const violations = await axePage.evaluate(async () => (await window.axe.run()).violations.map(({ id, impact }) => ({ id, impact })));
  const serious = violations.filter(({ impact }) => impact === "serious" || impact === "critical");
  assert.deepEqual(serious, []);
  results.axe[path] = { total: violations.length, seriousOrCritical: serious.length };
}
await axeContext.close();

await browser.close();
console.log(JSON.stringify(results, null, 2));
