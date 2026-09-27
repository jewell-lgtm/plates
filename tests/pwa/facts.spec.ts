import { test, expect } from '@playwright/test';

test('a newly researched fact stays hidden until spotted and reopens offline in either language', async ({ page, context }) => {
 await page.goto('/');
 await expect(page.getByText('The wrong house became the museum', { exact: true })).toHaveCount(0);
 await page.getByRole('textbox', { name: 'Plate city code' }).fill('EIL');
 await page.getByRole('button', { name: /Spotted!/ }).click();
 await expect(page.getByText('The wrong house became the museum', { exact: true })).toBeVisible();
 await expect(page.getByText(/Eisleben bought the wrong house in 1862/)).toBeVisible();
 await page.getByRole('button', { name: /Keep exploring/ }).click();
 await page.getByRole('button', { name: 'Deutsch', exact: true }).click();
 await page.evaluate(async () => { await navigator.serviceWorker.ready; });
 await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
 await context.setOffline(true);
 await page.reload();
 await page.getByRole('button', { name: 'Entdeckt 1', exact: true }).click();
 await page.getByRole('button', { name: /EIL, Eisleben/ }).click();
 await expect(page.getByText('Das falsche Haus wurde Museum', { exact: true })).toBeVisible();
 await expect(page.getByText(/Eisleben kaufte 1862 das falsche Haus/)).toBeVisible();
});
