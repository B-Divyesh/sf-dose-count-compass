import { chromium } from "playwright";
import axe from "axe-core";
import { mkdir, writeFile } from "node:fs/promises";

const [base = "http://127.0.0.1:4173", evidence = ".factory/evidence/polish-4", label = "local"] = process.argv.slice(2);
const production = "https://dose-count-compass.sociobot.in";
const results = { base, label };
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

await mkdir(evidence, { recursive: true });
const browser = await chromium.launch();

try {
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await mobile.newPage();
  const errors = [];
  const requests = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("request", (request) => requests.push(request.url()));

  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  const firstScreen = await page.evaluate(() => {
    const action = document.querySelector(".hero-actions .primary")?.getBoundingClientRect().toJSON();
    return {
      title: document.title,
      h1: document.querySelector("h1")?.textContent?.trim(),
      lead: document.querySelector(".lead")?.textContent?.trim(),
      action,
      facts: [...document.querySelectorAll(".facts li")].map((node) => node.textContent?.trim()),
      h1s: document.querySelectorAll("h1").length,
      main: Boolean(document.querySelector("main")),
      overflow: document.documentElement.scrollWidth > innerWidth,
    };
  });
  assert(firstScreen.title === "Dose Count Compass — Count medicine doses", "home title drifted");
  assert(firstScreen.h1 === "Count doses before you run out", "home heading drifted");
  assert(firstScreen.lead === "For people who track doses but do not need a full medicine app.", "audience copy drifted");
  assert(firstScreen.action?.height >= 44 && firstScreen.action?.bottom <= 844, "primary demo action is not visible and touch-sized");
  assert(JSON.stringify(firstScreen.facts) === JSON.stringify(["Saved in your browser", "Works offline after first visit", "Free to use"]), "first-screen facts drifted");
  assert(firstScreen.h1s === 1 && firstScreen.main && !firstScreen.overflow, "first-screen structure or reflow failed");
  await page.screenshot({ path: `${evidence}/${label}-home-mobile.png`, fullPage: true });
  results.firstScreen = firstScreen;

  await page.getByRole("link", { name: "My devices" }).click();
  await page.getByRole("button", { name: "Add a device" }).click();
  await page.getByLabel("Name").fill("Audit real inhaler");
  await page.getByLabel("Total doses").fill("100");
  await page.getByLabel("Doses left").fill("100");
  await page.getByLabel("Refill reminder count").fill("20");
  await page.getByRole("button", { name: "Save device" }).click();
  await page.getByRole("link", { name: "Dose Count Compass home" }).click();
  await page.getByRole("link", { name: "Try it with sample data" }).click();
  await page.waitForURL(`${base}/demo`);
  await page.getByText("Demo — sample data, nothing is saved").waitFor();
  assert(page.url() === `${base}/demo`, "landing action did not enter /demo in one click");
  assert(await page.getByText("Demo — sample data, nothing is saved").isVisible(), "demo banner is missing");
  for (const sample of ["Blue rescue inhaler", "Saline spray", "Travel injector"])
    assert(await page.getByText(sample).isVisible(), `sample is missing: ${sample}`);
  assert((await page.getByText("Audit real inhaler").count()) === 0, "real data leaked into demo");
  await page.getByRole("button", { name: "Log 1 puff" }).click();
  await page.waitForFunction(() => document.querySelector('[data-device="sample-blue"] .count-row strong')?.textContent === "41");
  assert(await page.locator('[data-device="sample-blue"] .count-row strong').textContent() === "41", "sample did not update");
  await page.getByRole("button", { name: "Start for real" }).click();
  await page.getByText("Audit real inhaler").waitFor();
  assert(await page.getByText("Audit real inhaler").isVisible(), "real list was changed by demo");
  await page.goto(`${base}/?demo=1`);
  assert(page.url() === `${base}/demo`, "?demo=1 did not enter /demo");
  assert(await page.locator('[data-device="sample-blue"] .count-row strong').textContent() === "42", "demo did not reset on exit");
  await page.screenshot({ path: `${evidence}/${label}-demo-mobile.png`, fullPage: true });
  results.demo = { oneClick: true, samples: 3, banner: true, resetTo: 42, realDataSeparate: true };

  await page.getByRole("navigation").getByRole("link", { name: "Privacy" }).click();
  await page.getByRole("heading", { name: "Your data stays in your browser" }).waitFor();
  assert(await page.getByRole("heading", { name: "Your data stays in your browser" }).evaluate((node) => node === document.activeElement), "route h1 was not focused");
  assert(await page.locator(".route-announcer").textContent() === "Now viewing: Your data stays in your browser", "route was not announced");
  await page.goBack();
  await page.waitForFunction(() => document.activeElement?.textContent?.trim() === "Three devices, counted for you");
  results.routeFocus = true;

  await page.waitForFunction(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await mobile.setOffline(true);
  await page.getByRole("button", { name: "Log 1 puff" }).click();
  await page.waitForFunction(() => document.querySelector('[data-device="sample-blue"] .count-row strong')?.textContent === "41");
  await page.reload();
  await page.locator('[data-device="sample-blue"] .count-row strong').waitFor();
  assert(await page.locator('[data-device="sample-blue"] .count-row strong').textContent() === "41", "offline change did not survive reload");
  const offline404 = await page.goto(`${base}/polish-4-offline-missing`);
  assert(offline404?.status() === 404, "controlled offline missing route was not HTTP 404");
  assert(await page.getByRole("heading", { name: "Page not found" }).isVisible(), "offline 404 direct heading is missing");
  assert((await page.getByRole("heading", { name: "Page not found" }).evaluate((node) => getComputedStyle(node).fontFamily)).includes("Georgia"), "offline 404 lost product styling");
  await mobile.setOffline(false);
  assert(requests.every((url) => url.startsWith(base)), "cross-origin request observed");
  assert(errors.filter((message) => /404\.css|ERR_FAILED|stylesheet|content security policy/i.test(message)).length === 0, "browser resource or policy error observed");
  results.offlineAndPrivacy = { savedCount: 41, missingStatus: 404, sameOriginOnly: true, browserErrors: [] };
  await mobile.close();

  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, bypassCSP: true });
  const desktopPage = await desktop.newPage();
  const raw404 = await desktopPage.goto(`${base}/polish-4-missing`, { waitUntil: "networkidle" });
  assert(raw404?.status() === 404, "raw missing route was not HTTP 404");
  assert(await desktopPage.getByRole("heading", { name: "Page not found" }).isVisible(), "F-4-1 heading is not fixed");
  assert(await desktopPage.getByRole("navigation").getByRole("link", { name: "Privacy" }).isVisible(), "404 navigation is incomplete");
  assert(await desktopPage.getByRole("contentinfo").getByRole("link", { name: "Terms" }).isVisible(), "404 legal footer is incomplete");
  await desktopPage.screenshot({ path: `${evidence}/${label}-404-desktop.png`, fullPage: true });
  results.f4_1 = { status: 404, heading: "Page not found", styled: true, sharedShell: true };

  const expectedRoutes = [
    ["/", "Dose Count Compass — Count medicine doses"],
    ["/demo", "Demo — Dose Count Compass"],
    ["/log", "Dose Count Compass — Track device doses"],
    ["/privacy", "Privacy — Dose Count Compass"],
    ["/terms", "Terms — Dose Count Compass"],
  ];
  results.routes = [];
  for (const [path, title] of expectedRoutes) {
    const response = await desktopPage.goto(`${base}${path}`, { waitUntil: "networkidle" });
    const metadata = await desktopPage.evaluate(() => ({
      title: document.title,
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
      description: document.querySelector('meta[name="description"]')?.getAttribute("content"),
      ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute("content"),
      twitterTitle: document.querySelector('meta[name="twitter:title"]')?.getAttribute("content"),
      h1s: document.querySelectorAll("h1").length,
      legal: [...document.querySelectorAll("footer a")].map((node) => node.textContent?.trim()),
    }));
    assert(response?.status() === 200, `${path} was not HTTP 200`);
    assert(metadata.title === title && metadata.ogTitle === title && metadata.twitterTitle === title, `${path} title metadata drifted`);
    assert(metadata.canonical === `${production}${path}`, `${path} canonical drifted`);
    assert(Boolean(metadata.description) && metadata.h1s === 1, `${path} structure drifted`);
    assert(metadata.legal.includes("Privacy") && metadata.legal.includes("Terms"), `${path} legal links drifted`);
    results.routes.push({ path, ...metadata });
  }

  results.axe = [];
  for (const path of ["/", "/demo", "/log", "/privacy", "/terms", "/polish-4-missing"]) {
    await desktopPage.goto(`${base}${path}`);
    await desktopPage.addScriptTag({ content: axe.source });
    const seriousOrCritical = await desktopPage.evaluate(async () => (await globalThis.axe.run()).violations.filter((violation) => ["serious", "critical"].includes(violation.impact)).length);
    assert(seriousOrCritical === 0, `axe found serious/critical violations at ${path}`);
    results.axe.push({ path, seriousOrCritical });
  }
  await desktop.close();

  results.completedAt = new Date().toISOString();
  await writeFile(`${evidence}/${label}-audit.json`, `${JSON.stringify(results, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
} finally {
  await browser.close();
}
