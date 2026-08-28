import { chromium } from "playwright";
import axe from "axe-core";
import { writeFile } from "node:fs/promises";

const base = "https://dose-count-compass.sociobot.in";
const evidence = "/work/repo/.factory/evidence/polish-2";
const results = {};
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const browser = await chromium.launch();

try {
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await mobile.newPage();
  const errors = [];
  const crossOrigin = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("request", (request) => {
    if (!request.url().startsWith(base)) crossOrigin.push(request.url());
  });

  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  const firstScreen = await page.evaluate(() => {
    const box = (selector) => document.querySelector(selector)?.getBoundingClientRect().toJSON();
    return {
      title: document.title,
      h1: document.querySelector("h1")?.textContent?.trim(),
      lead: document.querySelector(".lead")?.textContent?.trim(),
      action: box(".hero-actions .primary"),
      facts: [...document.querySelectorAll(".facts li")].map((node) => node.textContent?.trim()),
      overflow: document.documentElement.scrollWidth > innerWidth,
      h1Count: document.querySelectorAll("h1").length,
    };
  });
  assert(firstScreen.h1 === "Count doses before you run out", "live headline drifted");
  assert(firstScreen.lead === "For people who track doses but do not need a full medicine app.", "live audience copy drifted");
  assert(firstScreen.action && firstScreen.action.bottom <= 844 && firstScreen.action.height >= 44, "first action is not usable within mobile first screen");
  assert(JSON.stringify(firstScreen.facts) === JSON.stringify(["Saved in your browser", "Works offline after first visit", "Free to use"]), "first-screen facts drifted");
  assert(!firstScreen.overflow && firstScreen.h1Count === 1, "mobile home overflows or has the wrong h1 count");
  await page.screenshot({ path: `${evidence}/live-home-mobile.png`, fullPage: true });
  results.firstScreen = firstScreen;

  await page.goto(`${base}/log`);
  await page.getByRole("button", { name: "Add a device" }).click();
  await page.getByLabel("Name").fill("Live audit inhaler");
  await page.getByLabel("Total doses").fill("100");
  await page.getByLabel("Doses left").fill("100");
  await page.getByLabel("Refill reminder count").fill("20");
  await page.getByRole("button", { name: "Save device" }).click();
  await page.getByText("Live audit inhaler").waitFor();
  await page.goto(`${base}/?demo=1`);
  assert(page.url() === `${base}/demo`, "?demo=1 did not normalize to /demo");
  await page.getByText("Demo — sample data, nothing is saved").waitFor();
  for (const name of ["Blue rescue inhaler", "Saline spray", "Travel injector"])
    assert(await page.getByText(name).isVisible(), `missing live sample: ${name}`);
  assert((await page.getByText("Live audit inhaler").count()) === 0, "real data leaked into live demo");
  await page.getByRole("button", { name: "Log 1 puff" }).click();
  await page.locator('[data-device="sample-blue"] .count-row strong').getByText("41", { exact: true }).waitFor();
  assert((await page.locator('[data-device="sample-blue"] .count-row strong').textContent()) === "41", "demo edit did not apply");
  await page.getByRole("button", { name: "Start for real" }).click();
  await page.getByText("Live audit inhaler").waitFor();
  await page.goto(`${base}/?demo=1`);
  await page.locator('[data-device="sample-blue"] .count-row strong').getByText("42", { exact: true }).waitFor();
  assert((await page.locator('[data-device="sample-blue"] .count-row strong').textContent()) === "42", "Start for real did not discard demo edits");
  assert((await page.getByText("Live audit inhaler").count()) === 0, "real data leaked after demo re-entry");
  await page.screenshot({ path: `${evidence}/live-demo-mobile.png`, fullPage: true });
  results.demoIsolation = { queryNormalized: true, threeSamples: true, resetTo: 42, realRecordPreserved: true };

  const headingLevels = await page.locator("main h1, main h2, main h3, main h4, main h5, main h6").evaluateAll((headings) => headings.map((heading) => Number(heading.tagName.slice(1))));
  assert(headingLevels.every((level, index) => index === 0 ? level === 1 : level <= headingLevels[index - 1] + 1), "live dashboard heading outline skips a level");
  assert(await page.getByRole("heading", { name: "Tracked devices", level: 2 }).isVisible(), "Tracked devices h2 missing");
  results.headingLevels = headingLevels;

  await page.getByRole("navigation").getByRole("link", { name: "Privacy" }).click();
  assert(await page.getByRole("heading", { name: "Your data stays in your browser" }).evaluate((node) => node === document.activeElement), "route focus did not move to privacy h1");
  assert((await page.locator(".route-announcer").textContent()) === "Now viewing: Your data stays in your browser", "route announcement missing");
  await page.goBack();
  await page.waitForFunction(() => document.activeElement?.textContent?.trim() === "Three devices, counted for you");
  assert(await page.getByRole("heading", { name: "Three devices, counted for you" }).evaluate((node) => node === document.activeElement), "Back did not restore route heading focus");
  results.routeFocus = true;

  const expectedRoutes = [
    ["/", "Dose Count Compass — Count medicine doses", "https://dose-count-compass.sociobot.in/"],
    ["/demo", "Demo — Dose Count Compass", `${base}/demo`],
    ["/log", "My devices — Dose Count Compass", `${base}/log`],
    ["/privacy", "Privacy — Dose Count Compass", `${base}/privacy`],
    ["/terms", "Terms — Dose Count Compass", `${base}/terms`],
  ];
  const routeMetadata = [];
  for (const [path, title, canonical] of expectedRoutes) {
    const response = await page.goto(`${base}${path}`);
    assert(response?.status() === 200, `${path} did not return 200`);
    const metadata = await page.evaluate(() => ({
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.getAttribute("content"),
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
      ogUrl: document.querySelector('meta[property="og:url"]')?.getAttribute("content"),
      twitterTitle: document.querySelector('meta[name="twitter:title"]')?.getAttribute("content"),
      h1s: document.querySelectorAll("h1").length,
      legal: [...document.querySelectorAll("footer a")].map((node) => node.textContent?.trim()),
    }));
    assert(metadata.title === title && metadata.canonical === canonical && metadata.ogUrl === canonical, `${path} metadata drifted`);
    assert(metadata.description && metadata.twitterTitle === title && metadata.h1s === 1, `${path} metadata or h1 incomplete`);
    assert(metadata.legal.includes("Privacy") && metadata.legal.includes("Terms"), `${path} legal links missing`);
    routeMetadata.push({ path, ...metadata });
  }
  results.routeMetadata = routeMetadata;

  await page.goto(`${base}/demo`);
  await page.waitForFunction(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await mobile.setOffline(true);
  await page.getByRole("button", { name: "Log 1 puff" }).click();
  await page.locator('[data-device="sample-blue"] .count-row strong').getByText("41", { exact: true }).waitFor();
  await page.reload();
  assert((await page.locator('[data-device="sample-blue"] .count-row strong').textContent()) === "41", "live offline write did not survive reload");
  assert(errors.length === 0, `live browser errors before intentional 404: ${errors.join(" | ")}`);
  const errorsBeforeIntentional404 = [...errors];
  const offlineMissing = await page.goto(`${base}/offline-live-audit-missing`);
  assert(offlineMissing?.status() === 404, "controlled offline missing route was not a 404");
  assert(await page.getByRole("heading", { name: "This shelf is empty" }).isVisible(), "offline 404 content missing");
  assert((await page.getByRole("heading", { name: "This shelf is empty" }).evaluate((node) => getComputedStyle(node).fontFamily)).includes("Georgia"), "offline 404 stylesheet missing");
  await mobile.setOffline(false);
  const missingResourceErrors = errors.filter((message) => /404\.css|ERR_FAILED|stylesheet/i.test(message));
  results.offline = { writeReloadCount: 41, missingStatus: offlineMissing?.status(), styled404: true, missingResourceErrors };
  assert(crossOrigin.length === 0, `cross-origin traffic observed: ${crossOrigin.join(", ")}`);
  assert(missingResourceErrors.length === 0, `live 404 resource errors: ${errors.join(" | ")}`);
  results.privacy = { crossOriginRequests: crossOrigin, browserErrorsBeforeIntentional404: errorsBeforeIntentional404 };
  await mobile.close();

  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, bypassCSP: true });
  const desktopPage = await desktop.newPage();
  const raw404 = await desktopPage.goto(`${base}/live-audit-missing`);
  assert(raw404?.status() === 404, "online missing route did not return 404");
  const missingMeta = await desktopPage.evaluate(() => ({
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.getAttribute("content"),
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
    appleTouch: document.querySelector('link[rel="apple-touch-icon"]')?.getAttribute("href"),
    stylesheet: document.querySelector('link[rel="stylesheet"]')?.getAttribute("href"),
    navPrivacy: Boolean([...document.querySelectorAll("nav a")].find((node) => node.textContent?.trim() === "Privacy")),
    footerTerms: Boolean([...document.querySelectorAll("footer a")].find((node) => node.textContent?.trim() === "Terms")),
  }));
  assert(missingMeta.title === "Page not found — Dose Count Compass" && missingMeta.description && missingMeta.canonical.endsWith("/404.html"), "404 metadata incomplete");
  assert(missingMeta.appleTouch === "/icon-180.svg" && missingMeta.stylesheet === "/404.css" && missingMeta.navPrivacy && missingMeta.footerTerms, "404 shell incomplete");
  await desktopPage.screenshot({ path: `${evidence}/live-404-desktop.png`, fullPage: true });
  results.online404 = { status: raw404?.status(), ...missingMeta };

  const axeResults = [];
  for (const path of ["/", "/demo", "/log", "/privacy", "/terms", "/live-audit-missing"]) {
    await desktopPage.goto(`${base}${path}`);
    await desktopPage.addScriptTag({ content: axe.source });
    const violations = await desktopPage.evaluate(async () => (await globalThis.axe.run()).violations.filter((violation) => ["serious", "critical"].includes(violation.impact)));
    assert(violations.length === 0, `axe serious/critical violations at ${path}`);
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
