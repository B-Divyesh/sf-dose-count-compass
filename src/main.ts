import "./style.css";

type DeviceKind = "Inhaler" | "Spray" | "Injector" | "Other";
type DoseLog = { id: string; at: string; amount: number };
type Device = {
  id: string;
  name: string;
  kind: DeviceKind;
  total: number;
  remaining: number;
  threshold: number;
  notes: string;
  logs: DoseLog[];
  updated: string;
};
const isDemo = () =>
  location.pathname === "/demo" ||
  new URLSearchParams(location.search).get("demo") === "1";
let demo = isDemo();
let devices: Device[] = [];
let editing: string | null = null;
let licenseState = "";
const licenseKey = "sb_license:dose-count-compass";
const sample: Device[] = [
  {
    id: "sample-blue",
    name: "Blue rescue inhaler",
    kind: "Inhaler",
    total: 200,
    remaining: 42,
    threshold: 30,
    notes: "Keep in day bag.",
    updated: "2026-08-27T09:15:00.000Z",
    logs: [
      { id: "l1", at: "2026-08-27T09:15:00.000Z", amount: 2 },
      { id: "l2", at: "2026-08-24T13:20:00.000Z", amount: 2 },
    ],
  },
  {
    id: "sample-spray",
    name: "Saline spray",
    kind: "Spray",
    total: 120,
    remaining: 86,
    threshold: 20,
    notes: "Bathroom cabinet.",
    updated: "2026-08-25T07:00:00.000Z",
    logs: [{ id: "l3", at: "2026-08-25T07:00:00.000Z", amount: 2 }],
  },
  {
    id: "sample-injector",
    name: "Travel injector",
    kind: "Injector",
    total: 2,
    remaining: 1,
    threshold: 1,
    notes: "Check expiry separately.",
    updated: "2026-08-18T12:00:00.000Z",
    logs: [{ id: "l4", at: "2026-08-18T12:00:00.000Z", amount: 1 }],
  },
];

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
    const r = db.transaction("state").objectStore("state").get("devices");
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
async function writeState(value: Device[]) {
  const db = await openDb();
  return new Promise<void>((resolve, reject) => {
    const r = db
      .transaction("state", "readwrite")
      .objectStore("state")
      .put(value, "devices");
    r.onsuccess = () => resolve();
    r.onerror = () => reject(r.error);
  });
}
function esc(value: string) {
  const x = document.createElement("span");
  x.textContent = value;
  return x.innerHTML;
}
function id() {
  return crypto.randomUUID();
}
function pageTitle(path = location.pathname) {
  if (path === "/privacy") return "Privacy — Dose Count Compass";
  if (path === "/terms") return "Terms — Dose Count Compass";
  if (path === "/demo") return "Demo — Dose Count Compass";
  if (path === "/log") return "My devices — Dose Count Compass";
  return "Dose Count Compass — Count medicine doses";
}
async function navigate(path: string) {
  const nextDemo = path === "/demo";
  if (
    nextDemo !== demo ||
    (!nextDemo && devices.some((d) => d.id.startsWith("sample-")))
  ) {
    demo = nextDemo;
    const stored = await readState();
    devices = stored ?? (demo ? structuredClone(sample) : []);
    if (!stored && demo) await save();
  }
  history.pushState({}, "", path);
  render();
}
function status(device: Device) {
  if (device.remaining <= 0) return ["empty", "Empty — refill now"];
  if (device.remaining <= device.threshold)
    return ["low", "At refill threshold"];
  return ["good", "Enough for now"];
}
function unit(device: Device, number: number) {
  const noun =
    device.kind === "Spray"
      ? "spray"
      : device.kind === "Injector"
        ? "device"
        : device.kind === "Other"
          ? "dose"
          : "puff";
  return `${number} ${noun}${number === 1 ? "" : "s"}`;
}
function shell(body: string) {
  const demoBar = demo
    ? `<aside class="demo-bar" aria-label="Demo controls"><strong>Demo — sample data, nothing is saved</strong><button class="link-button" data-action="reset-demo">Reset demo</button><button class="link-button" data-action="start-real">Start for real</button></aside>`
    : "";
  return `<a class="skip" href="#main">Skip to content</a><header><a class="wordmark" href="/" data-route aria-label="Dose Count Compass home"><span aria-hidden="true">◒</span> Dose Count Compass</a><nav aria-label="Main navigation"><a href="/demo" data-route>Demo</a><a href="/log" data-route>My devices</a><a href="/privacy" data-route>Privacy</a></nav></header>${demoBar}<main id="main" tabindex="-1">${body}</main><footer><p>Count physical doses before a device runs out.</p><p><a href="/privacy" data-route>Privacy</a> · <a href="/terms" data-route>Terms</a> · Built by Param Factory · v1.0.0</p></footer><div class="toast" aria-live="polite" aria-atomic="true"></div>`;
}
function home() {
  return shell(
    `<section class="hero"><div class="hero-copy"><p class="eyebrow">OFFLINE DEVICE COUNTER</p><h1>Count doses before you run out</h1><p class="lead">For people tracking inhalers, sprays, injectables, and other medicine devices without a medication-management account.</p><div class="hero-actions"><a class="button primary" href="/demo" data-route>Try it with sample data</a><span>See three devices already counted.</span></div><ul class="facts"><li>Saved on this device</li><li>Works offline after first visit</li><li>$9 once for Compass Plus</li></ul></div><figure class="hero-art"><img src="/hero-diorama.webp" width="1200" height="800" fetchpriority="high" decoding="async" alt="Paper-cut shelf with generic inhaler, nasal spray, and injector."/><figcaption>Original paper-cut illustration. It does not show a real medicine.</figcaption></figure></section><section class="preview-section" aria-labelledby="preview-title"><div><p class="eyebrow">A SMALL INVENTORY</p><h2 id="preview-title">See the count, then take the next step</h2></div>${deviceCard(sample[0], true)}</section><section class="steps" aria-labelledby="steps-title"><h2 id="steps-title">How dose counting works</h2><ol><li><strong>Add a device.</strong> Enter the count printed on it.</li><li><strong>Log each use.</strong> The remaining count changes at once.</li><li><strong>Act at your threshold.</strong> Refill before the count reaches zero.</li></ol></section><section class="plain-note" aria-labelledby="limits-title"><h2 id="limits-title">What this does not do</h2><p>It does not replace the device indicator, prescription label, pharmacist, or clinician. Check expiry dates separately.</p><p>Your devices stay on this device unless you export them.</p></section><section class="paid" aria-labelledby="plus-title"><div><p class="eyebrow">ONE-TIME PURCHASE</p><h2 id="plus-title">Compass Plus — $9 once</h2><p>Save inventory snapshots and custom refill notes. Your counts, exports, and safety warnings stay free.</p><p aria-live="polite">${licenseState}</p></div><div><a class="button outline" href="https://api.sociobot.in/api/v1/products/dose-count-compass/checkout">Buy Compass Plus</a><form id="license-form" class="license-form"><label>Have a license? Paste it<input name="license" required aria-label="License token" /></label><button>Restore purchase</button></form></div></section>`,
  );
}
function deviceCard(d: Device, preview = false) {
  const [kind, text] = status(d);
  return `<article class="device-card ${kind}" data-device="${d.id}"><div class="device-top"><p class="device-kind">${d.kind}</p><span class="status ${kind}">${text}</span></div><h3>${esc(d.name)}</h3><div class="count-row"><strong>${d.remaining}</strong><span>of ${d.total} left<br>${unit(d, d.remaining)}</span></div><progress class="gauge" aria-label="Doses remaining" max="${d.total}" value="${d.remaining}">${d.remaining} of ${d.total}</progress>${preview ? '<p class="small">A refill threshold is set at 30 puffs.</p>' : `<div class="card-actions"><button data-action="dose" data-id="${d.id}" ${d.remaining === 0 ? "disabled" : ""}>Log 1 ${d.kind === "Spray" ? "spray" : d.kind === "Injector" ? "device" : d.kind === "Other" ? "dose" : "puff"}</button><button class="quiet" data-action="edit" data-id="${d.id}">Edit</button></div>`}</article>`;
}
function dashboard() {
  const low = devices.filter((d) => d.remaining <= d.threshold).length;
  return shell(
    `<section class="app-head"><div><p class="eyebrow">${demo ? "SAMPLE INVENTORY" : "MY INVENTORY"}</p><h1>${demo ? "Three devices, counted for you" : "Track the doses in each device"}</h1><p>${devices.length ? `${low ? `${low} device${low === 1 ? "" : "s"} needs attention.` : "Every device is above its refill threshold."}` : "Add your first device to see the count here."}</p></div><div class="app-buttons"><button class="button primary" data-action="add">Add a device</button><button class="button outline" data-action="print" ${devices.length ? "" : "disabled"}>Print inventory card</button></div></section><section class="device-grid" aria-label="Tracked devices">${devices.length ? devices.map((d) => deviceCard(d)).join("") : emptyState()}</section><section class="tool-row" aria-label="Data tools"><button data-action="export-json">Export backup</button><button data-action="export-csv">Export CSV</button><label class="file-label">Import backup<input type="file" accept="application/json" data-action="import" /></label></section><section class="safety-note"><h2>Use the count with the device indicator</h2><p>A count can be wrong if you miss a log. The physical device and its label remain the source of truth.</p></section>`,
  );
}
function emptyState() {
  return `<div class="empty"><h2>Your device list is empty</h2><p>Your counts will appear here after you add an inhaler, spray, injector, or other device.</p><button class="button primary" data-action="add">Add your first device</button></div>`;
}
function policy(title: string, content: string) {
  return shell(`<article class="prose"><h1>${title}</h1>${content}</article>`);
}
function modal() {
  const current = devices.find((d) => d.id === editing);
  const isEdit = Boolean(current);
  return `<dialog id="device-dialog" aria-labelledby="device-dialog-title"><form method="dialog" id="device-form"><div class="dialog-heading"><h2 id="device-dialog-title">${isEdit ? "Edit this device" : "Add a device"}</h2><button class="icon-button" value="cancel" aria-label="Close">×</button></div><p class="form-help">Use the total count printed on the device. You can change it later.</p><label>Name<input required name="name" maxlength="60" value="${esc(current?.name ?? "")}" placeholder="For example, blue rescue inhaler" /></label><label>Device type<select name="kind">${(["Inhaler", "Spray", "Injector", "Other"] as DeviceKind[]).map((k) => `<option ${current?.kind === k ? "selected" : ""}>${k}</option>`).join("")}</select></label><div class="form-grid"><label>Total doses<input required name="total" type="number" min="1" max="10000" value="${current?.total ?? ""}" /></label><label>Doses left<input required name="remaining" type="number" min="0" max="10000" value="${current?.remaining ?? ""}" /></label></div><label>Refill threshold<input required name="threshold" type="number" min="0" max="10000" value="${current?.threshold ?? ""}" /><small>Show an alert at this count.</small></label><label>Private note (optional)<textarea name="notes" maxlength="180" placeholder="Where it is kept">${esc(current?.notes ?? "")}</textarea></label><menu><button value="cancel" class="quiet">Cancel</button>${isEdit ? '<button value="delete" class="danger">Delete device</button>' : ""}<button value="save" class="button primary">Save device</button></menu></form></dialog>`;
}
function render() {
  document.title = pageTitle();
  const path = location.pathname;
  let view =
    path === "/privacy"
      ? policy(
          "Your data stays on this device",
          `<p>Dose Count Compass stores your device list and logs in your browser’s IndexedDB. It does not create an account or send your health data to us.</p><h2>Exports and purchases</h2><p>Exports are downloaded to your device only. If you choose Compass Plus, the checkout and license check are handled by Sociobot. We do not receive your device list.</p><h2>Contact</h2><p>For a privacy question, contact the Param Factory through its product listing.</p>`,
        )
      : path === "/terms"
        ? policy(
            "Terms for using Dose Count Compass",
            `<p>This tool helps you keep a personal count. It is not medical advice and cannot confirm a device is usable.</p><h2>Your responsibility</h2><p>Check the physical device, its indicator, label, expiry date, and your clinician or pharmacist’s instructions. Keep a backup when your situation requires it.</p><h2>Compass Plus</h2><p>Compass Plus is a one-time $9 license. Sociobot is the merchant of record. A refund can revoke the license.</p>`,
          )
        : path === "/demo" || path === "/log"
          ? dashboard()
          : path === "/"
            ? home()
            : policy(
                "This paper shelf is empty",
                `<p>That page does not exist. Return to your dose count.</p><p><a href="/" data-route>Go to Dose Count Compass</a></p>`,
              );
  document.querySelector("#app")!.innerHTML = view + (editing ? modal() : "");
  bind();
  const heading = document.querySelector("h1");
  heading?.setAttribute("tabindex", "-1");
  heading?.focus();
}
function toast(message: string) {
  const node = document.querySelector(".toast");
  if (node) {
    node.textContent = message;
    node.classList.add("show");
    setTimeout(() => node.classList.remove("show"), 2800);
  }
}
async function save() {
  await writeState(devices);
}
function download(filename: string, content: string, type: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
async function resetDemo() {
  devices = structuredClone(sample);
  await save();
  render();
  toast("Demo reset.");
}
async function bind() {
  document.querySelectorAll<HTMLAnchorElement>("[data-route]").forEach((a) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      void navigate(a.getAttribute("href")!);
    }),
  );
  document
    .querySelector('[data-action="start-real"]')
    ?.addEventListener("click", () => {
      demo = false;
      void navigate("/log");
    });
  document
    .querySelector('[data-action="reset-demo"]')
    ?.addEventListener("click", resetDemo);
  document
    .querySelector('[data-action="add"]')
    ?.addEventListener("click", () => {
      editing = "new";
      render();
      (
        document.querySelector("#device-dialog") as HTMLDialogElement
      ).showModal();
    });
  document
    .querySelectorAll<HTMLButtonElement>('[data-action="edit"]')
    .forEach((b) =>
      b.addEventListener("click", () => {
        editing = b.dataset.id!;
        render();
        (
          document.querySelector("#device-dialog") as HTMLDialogElement
        ).showModal();
      }),
    );
  document
    .querySelectorAll<HTMLButtonElement>('[data-action="dose"]')
    .forEach((b) =>
      b.addEventListener("click", async () => {
        const d = devices.find((x) => x.id === b.dataset.id)!;
        d.remaining--;
        d.updated = new Date().toISOString();
        d.logs.unshift({ id: id(), at: d.updated, amount: 1 });
        await save();
        render();
        toast(
          `Logged one ${d.kind === "Inhaler" ? "puff" : d.kind === "Spray" ? "spray" : "dose"}.`,
        );
      }),
    );
  document
    .querySelector('[data-action="print"]')
    ?.addEventListener("click", printCard);
  document
    .querySelector('[data-action="export-json"]')
    ?.addEventListener("click", () => {
      download(
        "dose-count-compass-backup.json",
        JSON.stringify({ version: 1, devices }, null, 2),
        "application/json",
      );
      toast("Backup downloaded.");
    });
  document
    .querySelector('[data-action="export-csv"]')
    ?.addEventListener("click", () => {
      const rows = ["device,type,total,remaining,threshold,updated"];
      devices.forEach((d) =>
        rows.push(
          [d.name, d.kind, d.total, d.remaining, d.threshold, d.updated]
            .map((v) => `"${String(v).replaceAll('"', '""')}"`)
            .join(","),
        ),
      );
      download("dose-count-compass.csv", rows.join("\n"), "text/csv");
      toast("CSV downloaded.");
    });
  document
    .querySelector<HTMLInputElement>('[data-action="import"]')
    ?.addEventListener("change", importBackup);
  const form = document.querySelector<HTMLFormElement>("#device-form");
  form?.addEventListener("submit", saveForm);
  document
    .querySelector<HTMLFormElement>("#license-form")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const token = String(
        new FormData(e.currentTarget as HTMLFormElement).get("license"),
      ).trim();
      if (token) await acceptLicense(token);
    });
}
async function saveForm(event: SubmitEvent) {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const action = (event.submitter as HTMLButtonElement | null)?.value;
  if (action === "delete" && editing && editing !== "new") {
    devices = devices.filter((d) => d.id !== editing);
    await save();
    editing = null;
    render();
    toast("Device removed.");
    return;
  }
  if (action !== "save") {
    editing = null;
    render();
    return;
  }
  const f = new FormData(form);
  const total = Number(f.get("total")),
    remaining = Number(f.get("remaining")),
    threshold = Number(f.get("threshold"));
  if (
    ![total, remaining, threshold].every(Number.isFinite) ||
    total < 1 ||
    remaining < 0 ||
    remaining > total ||
    threshold < 0
  ) {
    toast("Check the three count fields, then save again.");
    return;
  }
  const existing =
    editing && editing !== "new"
      ? devices.find((d) => d.id === editing)
      : undefined;
  const device: Device = {
    id: existing?.id ?? id(),
    name: String(f.get("name")).trim(),
    kind: f.get("kind") as DeviceKind,
    total,
    remaining,
    threshold,
    notes: String(f.get("notes")).trim(),
    logs: existing?.logs ?? [],
    updated: new Date().toISOString(),
  };
  if (!device.name) return;
  devices = existing
    ? devices.map((d) => (d.id === device.id ? device : d))
    : [device, ...devices];
  await save();
  editing = null;
  render();
  toast(existing ? "Device updated." : "Device added.");
}
async function importBackup(event: Event) {
  const input = event.currentTarget as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    if (!Array.isArray(parsed.devices)) throw new Error();
    devices = parsed.devices;
    await save();
    render();
    toast("Backup imported.");
  } catch {
    toast(
      "That backup could not be read. Choose a Dose Count Compass JSON backup.",
    );
  }
}
async function acceptLicense(token: string) {
  localStorage.setItem(licenseKey, token);
  licenseState = "Checking your license…";
  render();
  try {
    const response = await fetch(
      `https://api.sociobot.in/api/v1/products/dose-count-compass/verify?license=${encodeURIComponent(token)}`,
    );
    const result = (await response.json()) as { valid: boolean };
    localStorage.setItem(
      `${licenseKey}:verdict`,
      JSON.stringify({ at: Date.now(), valid: result.valid }),
    );
    licenseState = result.valid
      ? "Compass Plus is active on this device."
      : "This license is not active. You can buy Compass Plus again.";
  } catch {
    licenseState = "License saved. It will be checked when you are online.";
  }
  render();
}
function printCard() {
  const entries = devices
    .map(
      (d) =>
        `<tr><td>${esc(d.name)}</td><td>${d.kind}</td><td>${d.remaining} / ${d.total}</td><td>${d.threshold}</td></tr>`,
    )
    .join("");
  const win = window.open("", "_blank");
  if (!win) {
    toast("Allow pop-ups to print the inventory card.");
    return;
  }
  win.document.write(
    `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Dose Count Compass inventory card</title><link rel="stylesheet" href="/print.css"></head><body><main><h1>Dose Count Compass inventory</h1><p>Check physical indicators and labels too. Printed ${new Date().toLocaleDateString()}.</p><table><thead><tr><th>Device</th><th>Type</th><th>Left</th><th>Refill at</th></tr></thead><tbody>${entries}</tbody></table></main></body></html>`,
  );
  win.document.close();
  win.onload = () => win.print();
}
async function init() {
  const params = new URLSearchParams(location.search);
  const returnedLicense = params.get("license");
  if (returnedLicense) {
    localStorage.setItem(licenseKey, returnedLicense);
    params.delete("license");
    history.replaceState(
      {},
      "",
      `${location.pathname}${params.size ? `?${params}` : ""}`,
    );
  }
  const cached = localStorage.getItem(`${licenseKey}:verdict`);
  if (cached) {
    try {
      if (JSON.parse(cached).valid)
        licenseState = "Compass Plus is active on this device.";
    } catch {}
  }
  try {
    const stored = await readState();
    devices = stored ?? (demo ? structuredClone(sample) : []);
    if (!stored && demo) await save();
  } catch {
    devices = demo ? structuredClone(sample) : [];
  }
  render();
  const token = localStorage.getItem(licenseKey);
  if (
    token &&
    !demo &&
    (!cached || Date.now() - JSON.parse(cached).at > 86_400_000)
  )
    void acceptLicense(token);
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    let hasController = Boolean(navigator.serviceWorker.controller);
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (hasController) toast("A new version is ready.");
      hasController = true;
    });
  }
  window.addEventListener("popstate", () => {
    demo = location.pathname === "/demo";
    render();
  });
}
init();
