import { chromium } from "playwright";
import axe from "axe-core";
import { writeFile } from "node:fs/promises";

const base = "https://dose-count-compass.sociobot.in";
const evidence = "/work/repo/.factory/evidence/polish-3";
const results = {};
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
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
      overflow: document.documentElement.scrollWidth > innerWidth,
      h1s: document.querySelectorAll("h1").length,
    };
  });
  assert(firstScreen.title === "Dose Count Compass — Count medicine doses", "home title drifted");
  assert(firstScreen.h1 === "Count doses before you run out", "home headline drifted");
  assert(firstScreen.lead === "For people who track doses but do not need a full medicine app.", "home audience copy drifted");
  assert(firstScreen.action && firstScreen.action.height >= 44 && firstScreen.action.bottom <= 844, "first action is not visible and touch-sized");
  assert(JSON.stringify(firstScreen.facts) === JSON.stringify(["Saved in your browser", "Works offline after first visit", "Free to use"]), "first-screen facts drifted");
  assert(!firstScreen.overflow && firstScreen.h1s === 1, "home reflow or heading count failed");
  await page.screenshot({ path: `${evidence}/live-home-mobile.png`, fullPage: true });
  results.firstScreen = firstScreen;

  await page.goto(`${base}/log`, { waitUntil: "networkidle" });
  const logMetadata = await page.evaluate(() => ({
    title: document.title,
    ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute("content"),
    twitterTitle: document.querySelector('meta[name="twitter:title"]')?.getAttribute("content"),
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
  }));
  assert(logMetadata.title === "Dose Count Compass — Track device doses", "F-3-1 title is not fixed");
  assert(logMetadata.ogTitle === logMetadata.title && logMetadata.twitterTitle === logMetadata.title, "F-3-1 social titles are not fixed");
  assert(logMetadata.canonical === `${base}/log`, "log canonical drifted");
  await page.screenshot({ path: `${evidence}/live-log-title.png`, fullPage: true });
  results.f3_1 = logMetadata;

  await page.getByRole("button", { name: "Add a device" }).click();
  await page.getByLabel("Name").fill("Live audit inhaler");
  await page.getByLabel("Total doses").fill("100");
  await page.getByLabel("Doses left").fill("100");
  await page.getByLabel("Refill reminder count").fill("20");
  await page.getByRole("button", { name: "Save device" }).click();
  await page.getByRole("link", { name: "Dose Count Compass home" }).click();
  await page.getByRole("link", { name: "Try it with sample data" }).click();
  assert(page.url() === `${base}/demo`, "one-click demo did not open /demo");
  await page.getByText("Demo — sample data, nothing is saved").waitFor();
  for (const sample of ["Blue rescue inhaler", "Saline spray", "Travel injector"])
    assert(await page.getByText(sample).isVisible(), `demo sample is missing: ${sample}`);
  assert((await page.getByText("Live audit inhaler").count()) === 0, "real data leaked into demo");
  await page.getByRole("button", { name: "Log 1 puff" }).click();
  await page.locator('[data-device="sample-blue"] .count-row strong').getByText("41", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Start for real" }).click();
  await page.getByText("Live audit inhaler").waitFor();
  await page.goto(`${base}/?demo=1`);
  assert(page.url() === `${base}/demo`, "?demo=1 did not normalize to /demo");
  assert(await page.locator('[data-device="sample-blue"] .count-row strong').textContent() === "42", "Start for real did not reset demo data");
  assert((await page.getByText("Live audit inhaler").count()) === 0, "real data leaked after demo re-entry");
  await page.screenshot({ path: `${evidence}/live-demo-mobile.png`, fullPage: true });
  results.demoIsolation = { oneClick: true, samples: 3, resetTo: 42, realDataSeparate: true };

  await page.getByRole("navigation").getByRole("link", { name: "Privacy" }).click();
  assert(await page.getByRole("heading", { name: "Your data stays in your browser" }).evaluate((node) => node === document.activeElement), "route navigation did not focus the new h1");
  assert(await page.locator(".route-announcer").textContent() === "Now viewing: Your data stays in your browser", "route navigation did not announce the new view");
  await page.goBack();
  await page.waitForFunction(() => document.activeElement?.textContent?.trim() === "Three devices, counted for you");
  results.routeFocus = true;

  await page.waitForFunction(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await mobile.setOffline(true);
  await page.getByRole("button", { name: "Log 1 puff" }).click();
  await page.locator('[data-device="sample-blue"] .count-row strong').getByText("41", { exact: true }).waitFor();
  await page.reload();
  assert(await page.locator('[data-device="sample-blue"] .count-row strong').textContent() === "41", "offline dose was not retained after reload");
  const errorsBeforeMissing = [...errors];
  assert(errorsBeforeMissing.length === 0, `unexpected live browser error: ${errorsBeforeMissing.join(" | ")}`);
  const offline404 = await page.goto(`${base}/polish-3-offline-missing`);
  assert(offline404?.status() === 404, "offline controlled 404 did not retain HTTP 404 status");
  assert(await page.getByRole("heading", { name: "This shelf is empty" }).isVisible(), "offline 404 heading missing");
  assert((await page.getByRole("heading", { name: "This shelf is empty" }).evaluate((node) => getComputedStyle(node).fontFamily)).includes("Georgia"), "offline 404 stylesheet missing");
  await mobile.setOffline(false);
  assert(errors.filter((message) => /404\.css|ERR_FAILED|stylesheet/i.test(message)).length === 0, `live resource error: ${errors.join(" | ")}`);
  assert(requests.every((url) => url.startsWith(base)), `cross-origin request: ${requests.find((url) => !url.startsWith(base))}`);
  results.offlineAndPrivacy = { countAfterReload: 41, missingStatus: offline404?.status(), sameOriginRequests: true, errorsBeforeMissing, intentional404ConsoleMessages: errors };
  await mobile.close();

  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, bypassCSP: true });
  const desktopPage = await desktop.newPage();
  const expectedRoutes = [
    ["/", "Dose Count Compass — Count medicine doses"],
    ["/demo", "Demo — Dose Count Compass"],
    ["/log", "Dose Count Compass — Track device doses"],
    ["/privacy", "Privacy — Dose Count Compass"],
    ["/terms", "Terms — Dose Count Compass"],
  ];
  const routes = [];
  for (const [path, title] of expectedRoutes) {
    const response = await desktopPage.goto(`${base}${path}`, { waitUntil: "networkidle" });
    assert(response?.status() === 200, `${path} did not return 200`);
    await desktopPage.locator("main h1").waitFor();
    const metadata = await desktopPage.evaluate(() => ({
      title: document.title,
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
      description: document.querySelector('meta[name="description"]')?.getAttribute("content"),
      ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute("content"),
      ogUrl: document.querySelector('meta[property="og:url"]')?.getAttribute("content"),
      twitterTitle: document.querySelector('meta[name="twitter:title"]')?.getAttribute("content"),
      h1s: document.querySelectorAll("h1").length,
      legal: [...document.querySelectorAll("footer a")].map((node) => node.textContent?.trim()),
    }));
    assert(metadata.title === title && metadata.ogTitle === title && metadata.twitterTitle === title, `${path} title metadata drifted`);
    assert(metadata.canonical === `${base}${path}` && metadata.ogUrl === `${base}${path}`, `${path} URL metadata drifted`);
    assert(Boolean(metadata.description) && metadata.h1s === 1 && metadata.legal.includes("Privacy") && metadata.legal.includes("Terms"), `${path} structural metadata drifted`);
    routes.push({ path, ...metadata });
  }
  results.routes = routes;

  const raw404 = await desktopPage.goto(`${base}/polish-3-missing`);
  assert(raw404?.status() === 404, "online missing route did not return 404");
  assert(await desktopPage.getByRole("navigation").getByRole("link", { name: "Privacy" }).isVisible(), "404 shared navigation is incomplete");
  assert(await desktopPage.getByRole("contentinfo").getByRole("link", { name: "Terms" }).isVisible(), "404 legal footer is incomplete");
  await desktopPage.screenshot({ path: `${evidence}/live-404-desktop.png`, fullPage: true });
  results.online404 = { status: raw404?.status(), title: await desktopPage.title() };

  const axeResults = [];
  for (const path of ["/", "/demo", "/log", "/privacy", "/terms", "/polish-3-missing"]) {
    await desktopPage.goto(`${base}${path}`);
    await desktopPage.addScriptTag({ content: axe.source });
    const violations = await desktopPage.evaluate(async () => (await globalThis.axe.run()).violations.filter((violation) => ["serious", "critical"].includes(violation.impact)));
    assert(violations.length === 0, `axe serious/critical violation at ${path}`);
    axeResults.push({ path, seriousOrCritical: 0 });
  }
  results.axe = axeResults;
  await desktop.close();

  results.completedAt = new Date().toISOString();
  await writeFile(`${evidence}/live-audit.json`, `${JSON.stringify(results, null, 2)}\n`);
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
