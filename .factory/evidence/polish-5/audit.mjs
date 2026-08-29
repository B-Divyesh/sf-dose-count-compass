import { chromium } from "playwright";
import axe from "axe-core";
import { mkdir, writeFile } from "node:fs/promises";

const [base = "http://127.0.0.1:4173", evidence = ".factory/evidence/polish-5", label = "local"] = process.argv.slice(2);
const results = { base, label, findings: {} };
const assert = (condition, message) => { if (!condition) throw new Error(message); };

await mkdir(evidence, { recursive: true });
const browser = await chromium.launch();

try {
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await mobile.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });

  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  const firstScreen = await page.evaluate(() => {
    const action = document.querySelector(".hero-actions .primary")?.getBoundingClientRect().toJSON();
    return {
      h1: document.querySelector("h1")?.textContent?.trim(),
      lead: document.querySelector(".lead")?.textContent?.trim(),
      facts: [...document.querySelectorAll(".facts li")].map((node) => node.textContent?.trim()),
      action,
      overflow: document.documentElement.scrollWidth > innerWidth,
    };
  });
  assert(firstScreen.h1 === "Count doses before you run out", "first-screen heading drifted");
  assert(firstScreen.lead === "For people who track doses but do not need a full medicine app.", "first-screen audience drifted");
  assert(firstScreen.action?.height >= 44 && firstScreen.action?.bottom <= 844, "demo action is not visible and touch-sized");
  assert(JSON.stringify(firstScreen.facts) === JSON.stringify(["Saved in your browser", "Works offline after first visit", "Free to use"]), "first-screen facts drifted");
  assert(!firstScreen.overflow, "mobile first screen overflows");
  await page.screenshot({ path: `${evidence}/${label}-home-mobile.png`, fullPage: true });
  results.firstScreen = firstScreen;
  console.log("audit: first screen");

  await page.getByRole("link", { name: "Try it with sample data" }).click();
  await page.waitForURL(`${base}/demo`);
  await expectVisible(page, "Demo — sample data, nothing is saved");
  for (const name of ["Blue rescue inhaler", "Saline spray", "Travel injector"]) await expectVisible(page, name);
  const actionNames = await page.locator('[data-device] [data-action="dose"], [data-device] [data-action="edit"]').evaluateAll((buttons) => buttons.map((button) => button.getAttribute("aria-label")));
  assert(new Set(actionNames).size === actionNames.length, "device card actions are not uniquely named");
  assert(actionNames.includes("Log 1 puff for Blue rescue inhaler") && actionNames.includes("Edit Blue rescue inhaler"), "device card action names omit their device");
  await page.getByRole("button", { name: "Edit Blue rescue inhaler" }).click();
  await expectVisible(page, "You can edit the device details later.");
  await page.getByRole("button", { name: "Cancel" }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download dose history" }).click();
  await download;
  await expectVisible(page, "Dose-history spreadsheet downloaded.");
  await page.screenshot({ path: `${evidence}/${label}-demo-mobile.png`, fullPage: true });
  results.findings.f5_2 = { actionNames, unique: true };
  results.findings.f5_3 = { help: "You can edit the device details later." };
  results.findings.f5_4 = { toast: "Dose-history spreadsheet downloaded." };
  console.log("audit: card names and copy");

  await page.goto(`${base}/privacy`, { waitUntil: "domcontentloaded" });
  const contact = page.getByRole("link", { name: "Param Factory product listing (external link)" });
  await contact.waitFor();
  const contactHref = await contact.getAttribute("href");
  assert(contactHref === "https://hello-factory.sociobot.in/catalog/?q=dose-count-compass", "privacy contact link drifted");
  const contactResponse = await page.request.get(contactHref);
  assert(contactResponse.status() === 200, `privacy contact destination failed: ${contactResponse.status()}`);
  results.findings.f5_6 = { href: contactHref, status: contactResponse.status() };
  console.log("audit: privacy contact");

  await page.waitForFunction(() => navigator.serviceWorker.ready);
  await page.goto(`${base}/demo`, { waitUntil: "domcontentloaded" });
  await expectVisible(page, "Demo — sample data, nothing is saved");
  await page.reload();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await mobile.setOffline(true);
  await page.getByRole("button", { name: "Log 1 puff for Blue rescue inhaler" }).click();
  await page.waitForFunction(() => document.querySelector('[data-device="sample-blue"] .count-row strong')?.textContent === "41");
  await page.reload();
  await page.locator('[data-device="sample-blue"] .count-row strong').waitFor();
  assert(await page.locator('[data-device="sample-blue"] .count-row strong').textContent() === "41", "offline write did not survive reload");
  await mobile.setOffline(false);
  assert(errors.length === 0, `mobile console/page errors: ${errors.join(" | ")}`);
  results.offline = { savedCount: 41, errors };
  console.log("audit: offline");
  await mobile.close();

  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, bypassCSP: true });
  const desktopPage = await desktop.newPage();
  const missing = await desktopPage.goto(`${base}/polish-5-missing`, { waitUntil: "networkidle" });
  assert(missing?.status() === 404, "missing route is not HTTP 404");
  await expectVisible(desktopPage, "Page not found");
  await desktopPage.screenshot({ path: `${evidence}/${label}-404-desktop.png`, fullPage: true });
  for (const [path, title] of [["/", "Dose Count Compass — Count medicine doses"], ["/demo", "Demo — Dose Count Compass"], ["/log", "Dose Count Compass — Track device doses"], ["/privacy", "Privacy — Dose Count Compass"], ["/terms", "Terms — Dose Count Compass"]]) {
    const response = await desktopPage.goto(`${base}${path}`, { waitUntil: "networkidle" });
    assert(response?.status() === 200, `${path} was not HTTP 200`);
    assert(await desktopPage.title() === title, `${path} title drifted`);
    await desktopPage.addScriptTag({ content: axe.source });
    const severe = await desktopPage.evaluate(async () => (await globalThis.axe.run()).violations.filter((item) => ["serious", "critical"].includes(item.impact)).length);
    assert(severe === 0, `${path} has axe serious/critical findings`);
  }
  results.routesAndAxe = "pass";
  console.log("audit: routes and axe");
  await desktop.close();

  results.completedAt = new Date().toISOString();
  await writeFile(`${evidence}/${label}-audit.json`, `${JSON.stringify(results, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
} finally {
  await browser.close();
}

async function expectVisible(page, text) {
  const locator = page.getByText(text).first();
  await locator.waitFor({ state: "visible", timeout: 10_000 });
}
