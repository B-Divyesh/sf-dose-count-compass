import "./style.css";

type DeviceKind = "Inhaler" | "Spray" | "Injector" | "Other";
type DoseLog = { id: string; at: string; amount: number };
type Device = { id: string; name: string; kind: DeviceKind; total: number; remaining: number; threshold: number; notes: string; logs: DoseLog[]; updated: string };

const kinds: DeviceKind[] = ["Inhaler", "Spray", "Injector", "Other"];
const sample: Device[] = [
  { id: "sample-blue", name: "Blue rescue inhaler", kind: "Inhaler", total: 200, remaining: 42, threshold: 30, notes: "Keep in day bag.", updated: "2026-08-27T09:15:00.000Z", logs: [{ id: "l1", at: "2026-08-27T09:15:00.000Z", amount: 2 }, { id: "l2", at: "2026-08-24T13:20:00.000Z", amount: 2 }] },
  { id: "sample-spray", name: "Saline spray", kind: "Spray", total: 120, remaining: 86, threshold: 20, notes: "Bathroom cabinet.", updated: "2026-08-25T07:00:00.000Z", logs: [{ id: "l3", at: "2026-08-25T07:00:00.000Z", amount: 2 }] },
  { id: "sample-injector", name: "Travel injector", kind: "Injector", total: 2, remaining: 1, threshold: 1, notes: "Check expiry separately.", updated: "2026-08-18T12:00:00.000Z", logs: [{ id: "l4", at: "2026-08-18T12:00:00.000Z", amount: 1 }] },
];

const routeIsDemo = (path = location.pathname, search = location.search) => path === "/demo" || new URLSearchParams(search).get("demo") === "1";
let demo = routeIsDemo();
let devices: Device[] = [];
let editing: string | null = null;
let pendingImport: Device[] | null = null;
let returnFocusSelector: string | null = null;
let lastTriggerSelector: string | null = null;
let undoSnapshot: Device[] | null = null;
let undoTimer: number | undefined;

const dbName = () => `${demo ? "demo:" : "real:"}dose-count-compass`;
function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName(), 1);
    request.onupgradeneeded = () => request.result.createObjectStore("state");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function readState() {
  const db = await openDb();
  return new Promise<Device[] | undefined>((resolve, reject) => {
    const request = db.transaction("state").objectStore("state").get("devices");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function writeState(value: Device[]) {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const request = db.transaction("state", "readwrite").objectStore("state").put(value, "devices");
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
async function save() { await writeState(devices); }
function esc(value: string) { const node = document.createElement("span"); node.textContent = value; return node.innerHTML; }
const id = () => crypto.randomUUID();
const siteUrl = "https://dose-count-compass.sociobot.in";
const buildVersion = "1.2.1";
function pageTitle(path = location.pathname) {
  if (path === "/privacy") return "Privacy — Dose Count Compass";
  if (path === "/terms") return "Terms — Dose Count Compass";
  if (path === "/demo" || routeIsDemo(path)) return "Demo — Dose Count Compass";
  if (path === "/log") return "Dose Count Compass — Track device doses";
  return "Dose Count Compass — Count medicine doses";
}
function pageDescription(path = location.pathname) {
  if (path === "/privacy") return "See how Dose Count Compass keeps your dose records in your browser.";
  if (path === "/terms") return "Read the terms for using Dose Count Compass as a personal dose counter.";
  if (path === "/demo") return "Try a sample dose inventory without saving anything to your own device list.";
  if (path === "/log") return "Track the doses left in each medicine device on this device.";
  return "Count doses in inhalers, sprays, injectables, and other medicine devices before you run out.";
}
function setMetadata(path = location.pathname) {
  const title = pageTitle(path), description = pageDescription(path), url = `${siteUrl}${path}`;
  document.title = title;
  const set = (selector: string, value: string) => document.querySelector<HTMLMetaElement | HTMLLinkElement>(selector)?.setAttribute(selector.startsWith("link") ? "href" : "content", value);
  set('link[rel="canonical"]', url);
  set('meta[name="description"]', description);
  set('meta[property="og:title"]', title);
  set('meta[property="og:description"]', description);
  set('meta[property="og:url"]', url);
  set('meta[name="twitter:title"]', title);
  set('meta[name="twitter:description"]', description);
}
function status(device: Device) {
  if (device.remaining <= 0) return ["empty", "Empty — refill now"];
  if (device.remaining <= device.threshold) return ["low", "Refill reminder"];
  return ["good", "Enough for now"];
}
function unit(device: Device, number: number) {
  const noun = device.kind === "Spray" ? "spray" : device.kind === "Injector" ? "device" : device.kind === "Other" ? "dose" : "puff";
  return `${number} ${noun}${number === 1 ? "" : "s"}`;
}
function shell(body: string) {
  const demoBar = demo ? `<aside class="demo-bar" aria-label="Demo controls"><strong>Demo — sample data, nothing is saved</strong><button class="link-button" data-action="reset-demo">Reset demo</button><button class="link-button" data-action="start-real">Start for real</button></aside>` : "";
  const connection = navigator.onLine ? "Online" : "Offline";
  return `<a class="skip" href="#main">Skip to content</a><header><a class="wordmark" href="/" data-route aria-label="Dose Count Compass home"><span aria-hidden="true">◒</span> Dose Count Compass</a><nav aria-label="Main navigation"><a href="/demo" data-route>Demo</a><a href="/log" data-route>My devices</a><a href="/privacy" data-route>Privacy</a></nav></header>${demoBar}<p class="connection" role="status">${connection}</p><main id="main" tabindex="-1">${body}</main><footer><p>Count doses before a device runs out.</p><p><a href="/privacy" data-route>Privacy</a><a href="/terms" data-route>Terms</a><span>Built by Param Factory · v${buildVersion}</span></p></footer><p class="route-announcer" role="status" aria-live="polite" aria-atomic="true"></p><div class="toast" role="status" aria-live="polite" aria-atomic="true"><span class="toast-message"></span><button class="toast-undo" hidden>Undo</button></div>`;
}
function home() {
  return shell(`<section class="hero"><div class="hero-copy"><p class="eyebrow">PRIVATE DOSE COUNT</p><h1 tabindex="-1">Count doses before you run out</h1><p class="lead">For people who track doses but do not need a full medicine app.</p><div class="hero-actions"><a class="button primary" href="/demo" data-route>Try it with sample data</a><span>See three devices already counted.</span></div><ul class="facts"><li>Saved in your browser</li><li>Works offline after first visit</li><li>Free to use</li></ul></div><figure class="hero-art"><img src="/hero-diorama.webp" width="1200" height="800" fetchpriority="high" decoding="async" alt="Paper-cut shelf with generic inhaler, nasal spray, and injector."><figcaption>Original paper-cut illustration. It does not show a real medicine.</figcaption></figure></section><section class="preview-section" aria-labelledby="preview-title"><div><p class="eyebrow">A SMALL INVENTORY</p><h2 id="preview-title">Check doses left and refill status</h2><p>Download a backup file or dose-history spreadsheet from your device list.</p></div>${deviceCard(sample[0], true)}</section><section class="steps" aria-labelledby="steps-title"><h2 id="steps-title">How dose counting works</h2><ol><li><strong>Add a device.</strong> Enter the count printed on it.</li><li><strong>Log each use.</strong> Update the count.</li><li><strong>Plan a refill at your chosen count.</strong> The card shows a refill reminder before zero.</li></ol></section><section class="plain-note" aria-labelledby="limits-title"><h2 id="limits-title">What this does not do</h2><p>It does not replace the device indicator, prescription label, pharmacist, or clinician. Check expiry dates separately.</p><p>Saved in your browser.</p></section>`);
}
function deviceCard(device: Device, preview = false) {
  const [kind, message] = status(device);
  return `<article class="device-card ${kind}" data-device="${device.id}"><div class="device-top"><p class="device-kind">${device.kind}</p><span class="status ${kind}">${message}</span></div><h3>${esc(device.name)}</h3><div class="count-row"><strong>${device.remaining}</strong><span>of ${device.total} left<br>${unit(device, device.remaining)}</span></div><progress class="gauge" aria-label="Doses remaining" max="${device.total}" value="${device.remaining}">${device.remaining} of ${device.total}</progress>${preview ? "<p class=\"small\">A refill reminder starts at 30 puffs.</p>" : `<div class="card-actions"><button data-action="dose" data-id="${device.id}" ${device.remaining === 0 ? "disabled" : ""}>Log 1 ${device.kind === "Spray" ? "spray" : device.kind === "Injector" ? "device" : device.kind === "Other" ? "dose" : "puff"}</button><button class="quiet" data-action="edit" data-id="${device.id}">Edit</button></div>`}</article>`;
}
function dashboard() {
  const low = devices.filter((device) => device.remaining <= device.threshold).length;
  return shell(`<section class="app-head"><div><p class="eyebrow">${demo ? "SAMPLE INVENTORY" : "MY INVENTORY"}</p><h1 tabindex="-1">${demo ? "Three devices, counted for you" : "Track the doses in each device"}</h1><p>${devices.length ? low ? `${low} device${low === 1 ? "" : "s"} ${low === 1 ? "has" : "have"} a refill reminder.` : "Every device is above its refill reminder count." : "Add your first device to see the count here."}</p></div><div class="app-buttons"><button class="button primary" data-action="add">Add a device</button><button class="button outline" data-action="print" ${devices.length ? "" : "disabled"}>Print inventory card</button></div></section><section class="device-grid" aria-labelledby="devices-title"><h2 id="devices-title" class="device-grid-title">Tracked devices</h2>${devices.length ? devices.map((device) => deviceCard(device)).join("") : emptyState()}</section><section class="tool-row" aria-label="Data tools"><button data-action="export-json">Download backup file</button><button data-action="export-csv">Download dose history</button><label class="file-label">Import backup file<input type="file" accept="application/json" data-action="import"></label></section><section class="safety-note"><h2>Use the count with the device indicator</h2><p>A count can be wrong if you miss a log. The physical device and its label remain the source of truth.</p></section>`);
}
function emptyState() { return `<div class="empty"><h3>Your device list is empty</h3><p>Your counts will appear here after you add an inhaler, spray, injector, or other device.</p><button class="button primary" data-action="add">Add your first device</button></div>`; }
function policy(title: string, content: string) { return shell(`<article class="prose"><h1 tabindex="-1">${title}</h1>${content}</article>`); }
function deviceDialog() {
  const current = devices.find((device) => device.id === editing); const isEdit = Boolean(current);
  return `<dialog id="device-dialog" aria-labelledby="device-dialog-title"><form id="device-form"><div class="dialog-heading"><h2 id="device-dialog-title">${isEdit ? "Edit this device" : "Add a device"}</h2><button class="icon-button" value="cancel" aria-label="Close">×</button></div><p class="form-help">Use the total count printed on the device. You can change it later.</p><label>Name<input required name="name" maxlength="60" value="${esc(current?.name ?? "")}" placeholder="For example, blue rescue inhaler"></label><label>Device type<select name="kind">${kinds.map((kind) => `<option ${current?.kind === kind ? "selected" : ""}>${kind}</option>`).join("")}</select></label><div class="form-grid"><label>Total doses<input required name="total" type="number" min="1" max="10000" value="${current?.total ?? ""}"></label><label>Doses left<input required name="remaining" type="number" min="0" max="10000" value="${current?.remaining ?? ""}"></label></div><label>Refill reminder count<input required name="threshold" type="number" min="0" max="10000" value="${current?.threshold ?? ""}"><small>Show a refill reminder at this count.</small></label><label>Private note (optional)<textarea name="notes" maxlength="180" placeholder="Where it is kept">${esc(current?.notes ?? "")}</textarea></label><menu><button value="cancel" class="quiet">Cancel</button>${isEdit ? '<button value="delete" class="danger">Delete device</button>' : ""}<button value="save" class="button primary">Save device</button></menu></form></dialog>`;
}
function importDialog() {
  if (!pendingImport) return ""; const current = devices.length;
  return `<dialog id="import-dialog" aria-labelledby="import-dialog-title"><form id="import-form"><h2 id="import-dialog-title">Replace this device list?</h2><p>This backup contains ${pendingImport.length} device${pendingImport.length === 1 ? "" : "s"}. It will replace the ${current} device${current === 1 ? "" : "s"} currently shown.</p><p>You can undo this replacement for 30 seconds.</p><menu><button value="cancel" class="quiet">Keep current list</button><button value="replace" class="danger">Replace with backup</button></menu></form></dialog>`;
}
function render(focusHeading = false) {
  const path = location.pathname; setMetadata(path);
  const view = path === "/privacy" ? policy("Your data stays in your browser", `<p>Saved in your browser.</p><h2>Your choices</h2><p>Download or import a backup file only when you choose.</p><h2>Contact</h2><p>For a privacy question, contact the Param Factory through its product listing.</p>`) : path === "/terms" ? policy("Terms for using Dose Count Compass", `<p>This tool helps you keep a personal count. It is not medical advice and cannot confirm a device is usable.</p><h2>Your responsibility</h2><p>Check the physical device, its indicator, label, expiry date, and your clinician or pharmacist’s instructions. Keep a backup when your situation requires it.</p><h2>Price</h2><p>Dose Count Compass is free to use.</p>`) : path === "/demo" || path === "/log" || routeIsDemo() ? dashboard() : home();
  document.querySelector("#app")!.innerHTML = view + (editing ? deviceDialog() : "") + importDialog(); bind();
  if (editing) document.querySelector<HTMLDialogElement>("#device-dialog")?.showModal();
  if (pendingImport) document.querySelector<HTMLDialogElement>("#import-dialog")?.showModal();
  if (focusHeading) requestAnimationFrame(() => { const heading = document.querySelector<HTMLElement>("h1"); heading?.focus(); const announcer = document.querySelector<HTMLElement>(".route-announcer"); if (announcer && heading) announcer.textContent = `Now viewing: ${heading.textContent}`; });
  if (returnFocusSelector) { const selector = returnFocusSelector; returnFocusSelector = null; requestAnimationFrame(() => document.querySelector<HTMLElement>(selector)?.focus()); }
}
function toast(message: string, undo?: () => Promise<void> | void) {
  const node = document.querySelector<HTMLElement>(".toast"), label = document.querySelector<HTMLElement>(".toast-message"), button = document.querySelector<HTMLButtonElement>(".toast-undo");
  if (!node || !label || !button) return; window.clearTimeout(undoTimer); label.textContent = message; button.hidden = !undo; button.onclick = undo ? () => { void undo(); } : null; node.classList.add("show");
  undoTimer = window.setTimeout(() => { node.classList.remove("show"); button.hidden = true; button.onclick = null; }, undo ? 30000 : 2800);
}
async function restoreUndo() { if (!undoSnapshot) return; devices = structuredClone(undoSnapshot); undoSnapshot = null; await save(); render(); toast("Previous device list restored."); }
function download(filename: string, content: string, type: string) { const anchor = document.createElement("a"); anchor.href = URL.createObjectURL(new Blob([content], { type })); anchor.download = filename; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(anchor.href), 1000); }
async function loadNamespace() { const stored = await readState(); devices = stored ?? (demo ? structuredClone(sample) : []); if (!stored && demo) await save(); }
async function navigate(path: string) { history.pushState({}, "", path); demo = routeIsDemo(path, ""); editing = null; pendingImport = null; await loadNamespace(); render(true); }
async function syncLocation(focusHeading = false) { if (location.pathname === "/" && routeIsDemo()) history.replaceState({}, "", "/demo"); demo = routeIsDemo(); editing = null; pendingImport = null; await loadNamespace(); render(focusHeading); }
async function resetDemo() { devices = structuredClone(sample); await save(); render(); toast("Demo reset."); }
async function startReal() { devices = structuredClone(sample); await save(); await navigate("/log"); }
function csvCell(value: string | number) { return `"${String(value).replaceAll('"', '""')}"`; }
function exportCsv() {
  const rows = ["record_type,device_id,device,type,total,remaining,threshold,updated,event_at,dose_amount"];
  devices.forEach((device) => { rows.push(["device", device.id, device.name, device.kind, device.total, device.remaining, device.threshold, device.updated, "", ""].map(csvCell).join(",")); device.logs.forEach((log) => rows.push(["dose_log", device.id, device.name, device.kind, device.total, "", "", "", log.at, log.amount].map(csvCell).join(","))); });
  download("dose-count-compass-log.csv", rows.join("\n"), "text/csv"); toast("CSV downloaded.");
}
function isRecord(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === "object" && !Array.isArray(value); }
function validDate(value: unknown) { return typeof value === "string" && !Number.isNaN(Date.parse(value)); }
function validDevice(value: unknown): value is Device {
  if (!isRecord(value) || !kinds.includes(value.kind as DeviceKind) || typeof value.id !== "string" || !value.id || typeof value.name !== "string" || !value.name.trim() || value.name.length > 60 || typeof value.notes !== "string" || value.notes.length > 180 || !validDate(value.updated) || !Array.isArray(value.logs)) return false;
  if (![value.total, value.remaining, value.threshold].every((number) => typeof number === "number" && Number.isInteger(number))) return false;
  if ((value.total as number) < 1 || (value.remaining as number) < 0 || (value.remaining as number) > (value.total as number) || (value.threshold as number) < 0 || (value.threshold as number) > (value.total as number)) return false;
  return value.logs.every((log) => isRecord(log) && typeof log.id === "string" && Boolean(log.id) && validDate(log.at) && typeof log.amount === "number" && Number.isInteger(log.amount) && log.amount > 0);
}
function parseBackup(value: unknown): Device[] | null { if (!isRecord(value) || value.version !== 1 || !Array.isArray(value.devices) || !value.devices.every(validDevice)) return null; const ids = value.devices.map((device) => device.id); return new Set(ids).size === ids.length ? structuredClone(value.devices) : null; }
async function importBackup(event: Event) {
  const input = event.currentTarget as HTMLInputElement, file = input.files?.[0]; input.value = ""; if (!file) return;
  try { const parsed = parseBackup(JSON.parse(await file.text())); if (!parsed) throw new Error("Invalid backup"); pendingImport = parsed; lastTriggerSelector = ".file-label"; render(); } catch { toast("That backup is not valid. Choose a Dose Count Compass backup file."); }
}
async function saveForm(event: SubmitEvent) {
  event.preventDefault(); const form = event.currentTarget as HTMLFormElement, action = (event.submitter as HTMLButtonElement | null)?.value;
  if (action === "delete" && editing && editing !== "new") { const current = devices.find((device) => device.id === editing); if (!current || !confirm(`Delete ${current.name}? You can undo this for 30 seconds.`)) return; undoSnapshot = structuredClone(devices); devices = devices.filter((device) => device.id !== editing); await save(); editing = null; returnFocusSelector = lastTriggerSelector; render(); toast(`${current.name} was deleted.`, restoreUndo); return; }
  if (action !== "save") { editing = null; returnFocusSelector = lastTriggerSelector; render(); return; }
  const fields = new FormData(form), total = Number(fields.get("total")), remaining = Number(fields.get("remaining")), threshold = Number(fields.get("threshold"));
  if (![total, remaining, threshold].every(Number.isFinite) || ![total, remaining, threshold].every(Number.isInteger) || total < 1 || remaining < 0 || remaining > total || threshold < 0 || threshold > total) { toast("Set whole-number counts: total at least 1, and refill reminder no higher than total."); return; }
  const existing = editing && editing !== "new" ? devices.find((device) => device.id === editing) : undefined;
  const device: Device = { id: existing?.id ?? id(), name: String(fields.get("name")).trim(), kind: fields.get("kind") as DeviceKind, total, remaining, threshold, notes: String(fields.get("notes")).trim(), logs: existing?.logs ?? [], updated: new Date().toISOString() };
  if (!device.name) return; devices = existing ? devices.map((item) => item.id === device.id ? device : item) : [device, ...devices]; await save(); editing = null; returnFocusSelector = lastTriggerSelector; render(); toast(existing ? "Device updated." : "Device added.");
}
async function confirmImport(event: SubmitEvent) { event.preventDefault(); const action = (event.submitter as HTMLButtonElement | null)?.value; if (action !== "replace" || !pendingImport) { pendingImport = null; returnFocusSelector = lastTriggerSelector; render(); return; } undoSnapshot = structuredClone(devices); devices = pendingImport; pendingImport = null; await save(); returnFocusSelector = lastTriggerSelector; render(); toast("Backup imported. You can undo this replacement.", restoreUndo); }
function printCard() {
  const entries = devices.map((device) => `<tr><td>${esc(device.name)}</td><td>${device.kind}</td><td>${device.remaining} / ${device.total}</td><td>${device.threshold}</td></tr>`).join(""); const win = window.open("", "_blank"); if (!win) return toast("Allow pop-ups to print the inventory card.");
  win.document.write(`<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Dose Count Compass inventory card</title><link rel="stylesheet" href="/print.css"></head><body><main><h1>Dose Count Compass inventory</h1><p>Check physical indicators and labels too. Printed ${new Date().toLocaleDateString()}.</p><table><thead><tr><th>Device</th><th>Type</th><th>Left</th><th>Refill at</th></tr></thead><tbody>${entries}</tbody></table></main></body></html>`); win.document.close(); win.onload = () => win.print();
}
function bind() {
  document.querySelectorAll<HTMLAnchorElement>("[data-route]").forEach((anchor) => anchor.addEventListener("click", (event) => { event.preventDefault(); void navigate(anchor.getAttribute("href")!); }));
  document.querySelector('[data-action="start-real"]')?.addEventListener("click", () => void startReal()); document.querySelector('[data-action="reset-demo"]')?.addEventListener("click", () => void resetDemo());
  document.querySelectorAll<HTMLElement>('[data-action="add"]').forEach((button) => button.addEventListener("click", () => { lastTriggerSelector = '[data-action="add"]'; editing = "new"; render(); }));
  document.querySelectorAll<HTMLButtonElement>('[data-action="edit"]').forEach((button) => button.addEventListener("click", () => { lastTriggerSelector = `[data-action="edit"][data-id="${button.dataset.id}"]`; editing = button.dataset.id!; render(); }));
  document.querySelectorAll<HTMLButtonElement>('[data-action="dose"]').forEach((button) => button.addEventListener("click", async () => { const device = devices.find((item) => item.id === button.dataset.id); if (!device || device.remaining <= 0 || !Array.isArray(device.logs)) return; device.remaining--; device.updated = new Date().toISOString(); device.logs.unshift({ id: id(), at: device.updated, amount: 1 }); await save(); render(); toast(`Logged one ${device.kind === "Inhaler" ? "puff" : device.kind === "Spray" ? "spray" : "dose"}.`); }));
  document.querySelector('[data-action="print"]')?.addEventListener("click", printCard); document.querySelector('[data-action="export-json"]')?.addEventListener("click", () => { download("dose-count-compass-backup.json", JSON.stringify({ version: 1, devices }, null, 2), "application/json"); toast("Backup file downloaded."); }); document.querySelector('[data-action="export-csv"]')?.addEventListener("click", exportCsv);
  document.querySelector<HTMLInputElement>('[data-action="import"]')?.addEventListener("change", importBackup); document.querySelector<HTMLFormElement>("#device-form")?.addEventListener("submit", saveForm); document.querySelector<HTMLFormElement>("#import-form")?.addEventListener("submit", confirmImport);
  document.querySelector<HTMLDialogElement>("#device-dialog")?.addEventListener("cancel", (event) => { event.preventDefault(); editing = null; returnFocusSelector = lastTriggerSelector; render(); }); document.querySelector<HTMLDialogElement>("#import-dialog")?.addEventListener("cancel", (event) => { event.preventDefault(); pendingImport = null; returnFocusSelector = lastTriggerSelector; render(); });
}
async function init() {
  await syncLocation(false); window.addEventListener("popstate", () => void syncLocation(true)); window.addEventListener("online", () => render()); window.addEventListener("offline", () => render());
  if ("serviceWorker" in navigator) { navigator.serviceWorker.register("/sw.js").catch(() => undefined); let hasController = Boolean(navigator.serviceWorker.controller); navigator.serviceWorker.addEventListener("controllerchange", () => { if (hasController) toast("A new version is ready."); hasController = true; }); }
}
void init();
