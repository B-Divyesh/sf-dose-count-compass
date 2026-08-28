import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('@claim:offline-reload Works offline after the first visit', async ({ page, context }) => {
  await page.goto('/demo');
  await page.waitForFunction(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Three devices, counted for you' })).toBeVisible();
  await context.setOffline(false);
});

test('@claim:csv-export Exports the log as CSV', async ({ page }) => {
  await page.goto('/demo');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const file = await download;
  expect(await readFile((await file.path())!, 'utf8')).toContain('device,type,total,remaining,threshold,updated');
});

test('@claim:local-only Demo tracking makes no cross-origin requests', async ({ page }) => {
  const crossOrigin: string[] = [];
  page.on('request', request => { if (!request.url().startsWith('http://127.0.0.1:4173')) crossOrigin.push(request.url()); });
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Log 1 puff' }).click();
  expect(crossOrigin).toEqual([]);
});

test('keyboard users can add a device', async ({ page }) => {
  await page.goto('/log');
  await page.getByRole('button', { name: 'Add a device' }).press('Enter');
  await expect(page.getByRole('heading', { name: 'Add a device' })).toBeVisible();
  await page.getByLabel('Name').fill('Pocket inhaler');
  await page.getByLabel('Total doses').fill('120');
  await page.getByLabel('Doses left').fill('120');
  await page.getByLabel('Refill threshold').fill('20');
  await page.getByRole('button', { name: 'Save device' }).click();
  await expect(page.getByText('Pocket inhaler')).toBeVisible();
});
