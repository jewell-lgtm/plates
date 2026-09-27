import { test, expect, chromium } from '@playwright/test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const appUrl = process.env.E2E_BASE_URL || 'http://localhost:4173';

test('manifest, legacy migration, offline cold start, writes and removal', async ({ page, context }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('plates.sightings.v1', JSON.stringify({ B: '2026-09-27T12:00:00.000Z' })));
  // The initial page already migrated empty storage; recreate the database to simulate an upgrade.
  await page.evaluate(() => new Promise<void>((resolve, reject) => {
    const r = indexedDB.deleteDatabase('plates'); r.onsuccess = () => resolve(); r.onerror = () => reject(r.error);
  }));
  await page.reload();
  await expect(page.getByRole('button', { name: 'Spotted 1', exact: true })).toBeVisible();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  const manifest = await (await page.request.get('/manifest.webmanifest')).json();
  expect(manifest.display).toBe('standalone');
  for (const icon of manifest.icons) expect((await page.request.get(icon.src)).ok()).toBeTruthy();
  await context.setOffline(true);
  await page.reload();
  await page.getByRole('button', { name: 'Spotted 1', exact: true }).click();
  await page.getByRole('button', { name: 'B, Berlin. Open fact', exact: true }).click();
  await expect(page.getByText('A mountain made of yesterday.')).toBeVisible();
  await page.getByRole('button', { name: 'Keep exploring' }).click();
  await page.getByRole('textbox').fill('hh');
  await page.getByRole('button', { name: /Spotted!/ }).click();
  await expect(page.getByText('Yes, “Swan Father” is a job.')).toBeVisible();
  await page.getByRole('button', { name: 'Added by mistake? Remove sighting' }).click();
  await expect(page.getByRole('button', { name: 'Keep exploring' })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Spotted 1', exact: true })).toBeVisible();
  // The legacy backup must not resurrect deleted sightings.
  await page.getByRole('button', { name: 'Spotted 1', exact: true }).click();
  await page.getByRole('button', { name: 'B, Berlin. Open fact', exact: true }).click();
  await page.getByRole('button', { name: 'Added by mistake? Remove sighting' }).click();
  await expect(page.getByRole('button', { name: 'Keep exploring' })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Spotted 0', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('stale tabs merge sightings and failed writes do not unlock a plate', async ({ page, context }) => {
  await page.goto('/');
  const other = await context.newPage(); await other.goto(appUrl);
  for (const [tab, code] of [[page, 'B'], [other, 'HH']] as const) {
    await tab.getByRole('textbox').fill(code);
    await tab.getByRole('button', { name: /Spotted!/ }).click();
    await tab.getByRole('button', { name: 'Keep exploring' }).click();
  }
  await page.reload();
  await expect(page.getByRole('button', { name: 'Spotted 2', exact: true })).toBeVisible();
  await page.evaluate(() => { IDBObjectStore.prototype.put = () => { throw new DOMException('Disk full', 'QuotaExceededError'); }; });
  await page.getByRole('textbox').fill('W');
  await page.getByRole('button', { name: /Spotted!/ }).click();
  await expect(page.getByText('Couldn’t save this sighting. Please try again.')).toBeVisible();
  await expect(page.getByText('The elephant left the tram.')).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Spotted 2', exact: true })).toBeVisible();
});

test('collection and app survive a browser restart offline', async () => {
  const profile = await mkdtemp(join(tmpdir(), 'plates-pwa-'));
  let browser = await chromium.launchPersistentContext(profile, { channel: 'chrome', headless: !process.env.E2E_HEADED });
  try {
    let page = await browser.newPage(); await page.goto(appUrl);
    await page.getByRole('textbox').fill('BÜS');
    await page.getByRole('button', { name: /Spotted!/ }).click();
    await expect(page.getByText('Germany, surrounded by Switzerland.')).toBeVisible();
    await page.evaluate(() => navigator.serviceWorker.ready);
    await browser.close();
    browser = await chromium.launchPersistentContext(profile, { channel: 'chrome', headless: !process.env.E2E_HEADED, offline: true });
    page = await browser.newPage(); await page.goto(appUrl);
    await page.getByRole('button', { name: 'Spotted 1', exact: true }).click();
    await page.getByRole('button', { name: /BÜS,.*Open fact/ }).click();
    await expect(page.getByText('Germany, surrounded by Switzerland.')).toBeVisible();
  } finally { await browser.close(); await rm(profile, { recursive: true, force: true }); }
});

test('groups mystery and spotted plates by combined Bundesland and links to GitHub', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Baden-Württemberg', exact: true })).toBeAttached();
  await expect(page.getByLabel('Unseen 2-letter plate').first()).toBeAttached();
  for (const code of ['B', 'P', 'HH', 'HB']) {
    await page.getByRole('textbox').fill(code);
    await page.getByRole('button', { name: /Spotted!/ }).click();
    await page.getByRole('button', { name: 'Keep exploring' }).click();
    await expect(page.getByRole('button', { name: 'Keep exploring' })).toHaveCount(0);
  }
  await page.getByRole('button', { name: 'Spotted 4', exact: true }).click();
  await expect(page.getByRole('heading')).toHaveText(['Berlin / Brandenburg', 'Bremen / Niedersachsen', 'Hamburg / Schleswig-Holstein']);
  await expect(page.getByRole('button', { name: 'B, Berlin. Open fact', exact: true })).toBeAttached();
  const link = page.getByRole('link', { name: 'View Schildersafari on GitHub' });
  await expect(link).toBeAttached();
  const popupPromise = page.waitForEvent('popup');
  await link.click();
  const popup = await popupPromise;
  await popup.waitForURL('https://github.com/jewell-lgtm/plates');
  await popup.close();
  await page.getByRole('button', { name: 'Unseen', exact: true }).click();
  await expect(page.getByRole('button', { name: 'B, Berlin. Open fact', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'About the collection' }).click();
  await expect(page.getByRole('link', { name: 'View Schildersafari on GitHub' }).last()).toBeVisible();
});
