import { test, expect } from '@playwright/test';

test('German browser locale, translated facts and persistent manual language override', async ({ browser }) => {
 const context = await browser.newContext({ locale: 'de-DE', viewport: { width: 390, height: 844 } });
 const page = await context.newPage(); await page.goto(process.env.E2E_BASE_URL || 'http://localhost:4173');
 await expect(page.getByText('Was hast du entdeckt?')).toBeVisible();
 await expect(page.locator('html')).toHaveAttribute('lang', 'de');
 await page.getByRole('textbox', { name: 'Ortskürzel des Kennzeichens' }).fill('b');
 await page.getByRole('button', { name: /Entdeckt!/ }).click();
 await expect(page.getByText('Ein Berg aus Vergangenheit.')).toBeVisible();
 await expect(page.getByRole('button', { name: 'Meinen Standort speichern', exact: true })).toBeAttached();
 await page.getByRole('button', { name: /Weiter entdecken/ }).click();
 await page.getByRole('button', { name: 'English', exact: true }).click();
 await expect(page.getByText('What did you spot?')).toBeVisible();
 await page.reload(); await expect(page.getByText('What did you spot?')).toBeVisible();
 await expect(page.locator('html')).toHaveAttribute('lang', 'en');
 await page.getByRole('button', { name: 'Spotted 1', exact: true }).click();
 await page.getByRole('button', { name: 'B, Berlin. Open fact', exact: true }).click();
 await expect(page.getByText('A mountain made of yesterday.')).toBeVisible();
 await page.getByRole('button', { name: /Keep exploring/ }).click();
 await page.getByRole('button', { name: 'Automatic', exact: true }).click();
 await expect(page.getByText('Was hast du entdeckt?')).toBeVisible();
 await expect(page.getByRole('button', { name: 'Entdeckt 1', exact: true })).toBeVisible();
 expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
 await context.close();
});

test('GPS is never requested implicitly; save, update, reload and remove work', async ({ page, context }) => {
 await context.grantPermissions(['geolocation']); await context.setGeolocation({ latitude: 52.52, longitude: 13.405, accuracy: 15 });
 await page.addInitScript(() => {
  const original = navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);
  (window as any).__gpsRequests = 0;
  navigator.geolocation.getCurrentPosition = (...args) => { (window as any).__gpsRequests++; original(...args); };
 });
 await page.goto('/');
 await page.getByRole('textbox', { name: 'Plate city code' }).fill('B');
 await page.getByRole('button', { name: /Spotted!/ }).click();
 await expect(page.getByText('A mountain made of yesterday.')).toBeAttached();
 expect(await page.evaluate(() => (window as any).__gpsRequests)).toBe(0);
 await page.getByRole('button', { name: 'Save my location', exact: true }).click();
 await expect(page.getByText('52.52000, 13.40500')).toBeVisible();
 expect(await page.evaluate(() => (window as any).__gpsRequests)).toBe(1);
 await context.setGeolocation({ latitude: 48.137, longitude: 11.576, accuracy: 8 });
 await page.getByRole('button', { name: 'Update to my current location', exact: true }).click();
 await expect(page.getByText('48.13700, 11.57600')).toBeVisible();
 await page.reload();
 await page.getByRole('button', { name: 'Spotted 1', exact: true }).click();
 await page.getByRole('button', { name: 'B, Berlin. Open fact', exact: true }).click();
 await expect(page.getByText('48.13700, 11.57600')).toBeVisible();
 expect(await page.evaluate(() => (window as any).__gpsRequests)).toBe(0);
 await page.getByRole('button', { name: 'Remove saved location', exact: true }).click();
 await expect(page.getByRole('button', { name: 'Save my location', exact: true })).toBeVisible();
 await expect(page.getByText('48.13700, 11.57600')).toHaveCount(0);
 await page.reload();
 await page.getByRole('button', { name: 'Spotted 1', exact: true }).click();
 await page.getByRole('button', { name: 'B, Berlin. Open fact', exact: true }).click();
 await expect(page.getByRole('button', { name: 'Save my location', exact: true })).toBeVisible();
});

test('GPS denial never prevents plate collection', async ({ page }) => {
 await page.addInitScript(() => { navigator.geolocation.getCurrentPosition = (_success, error) => error?.({ code: 1, message: 'Denied', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 }); });
 await page.goto('/'); await page.getByRole('textbox', { name: 'Plate city code' }).fill('HH'); await page.getByRole('button', { name: /Spotted!/ }).click();
 await page.getByRole('button', { name: 'Save my location', exact: true }).click();
 await expect(page.getByText('Location permission denied. You can still collect plates without it.')).toBeVisible();
 await page.getByRole('button', { name: /Keep exploring/ }).click();
 await expect(page.getByRole('button', { name: 'Spotted 1', exact: true })).toBeVisible();
});

test('backups merge into an existing collection and reject invalid input', async ({ page }) => {
 await page.goto('/'); await page.getByRole('textbox', { name: 'Plate city code' }).fill('B'); await page.getByRole('button', { name: /Spotted!/ }).click();
 await page.getByRole('button', { name: /Keep exploring/ }).click();
 await page.getByRole('button', { name: 'About the collection' }).click();
 await page.getByRole('button', { name: 'Show backup', exact: true }).click();
 await expect(page.getByRole('textbox', { name: 'Collection backup' })).toHaveValue(/sightings/);
 const text = await page.getByRole('textbox', { name: 'Collection backup' }).inputValue();
 expect(JSON.parse(text).sightings.B).toBeTruthy(); expect(text).not.toContain('latitude');
 await page.getByRole('textbox', { name: 'Collection backup' }).fill(JSON.stringify({ app: 'schildersafari', version: 1, sightings: { HH: '2026-09-27T10:00:00.000Z' } }));
 await page.getByRole('button', { name: 'Import backup', exact: true }).click();
 await expect(page.getByText('Backup imported.', { exact: true })).toBeVisible();
 await page.getByRole('textbox', { name: 'Collection backup' }).fill('not json');
 await page.getByRole('button', { name: 'Import backup', exact: true }).click();
 await expect(page.getByText('Invalid backup. Your collection has not changed.')).toBeVisible();
 await page.getByText('Let’s explore', { exact: true }).click();
 await expect(page.getByRole('button', { name: 'Spotted 2', exact: true })).toBeVisible();
 await page.reload(); await expect(page.getByRole('button', { name: 'Spotted 2', exact: true })).toBeVisible();
});

test('crawler and social metadata are available without running JavaScript', async ({ request }) => {
 const html = await (await request.get('/')).text();
 expect(html).toContain('https://schildersafari.de/social-card.png');
 expect(html).toContain('property="og:title"'); expect(html).toContain('name="twitter:card"'); expect(html).toContain('rel="canonical"'); expect(html).toContain('application/ld+json');
 for(const path of ['/robots.txt','/sitemap.xml','/llms.txt','/social-card.png']) expect((await request.get(path)).ok()).toBe(true);
 expect(await (await request.get('/robots.txt')).text()).toContain('https://schildersafari.de/sitemap.xml');
});
