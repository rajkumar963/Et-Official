import { test, expect, type Page } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Sign-up now emails a 6-digit code. Without RESEND_API_KEY the dev backend writes each email to
 * .runtime/outbox/<recipient>.json, which is where this reads the code from.
 */
async function verifyEmail(page: Page, email: string) {
  await expect(page).toHaveURL(/\/verify-email/);
  const file = join(__dirname, '..', '..', '.runtime', 'outbox', `${email.toLowerCase()}.json`);
  await expect.poll(() => existsSync(file)).toBe(true);
  const code = JSON.parse(readFileSync(file, 'utf8')).text.match(/(\d{6})/)[1];
  await page.getByLabel('Verification code').fill(code);
  await page.getByRole('button', { name: 'Verify and continue' }).click();
  await expect(page).toHaveURL(/\/$/); // signed-in users land on the home page
  await page.goto('/dashboard');
}
test('signup, create, edit, calendar, baseline and delete', async ({ page }) => {
  await page.goto('/signup');
  await page.getByLabel('Full name', { exact: true }).fill('Workflow Tester');
  const email = `workflow-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@example.com`;
  await page.getByLabel('Email address', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill('WorkflowTest2026!');
  await page.getByRole('button', { name: 'Create your journal' }).click();
  await verifyEmail(page, email);
  await expect(page.getByRole('heading', { name: 'Dashboard Overview' })).toBeVisible();
  await page.getByRole('button', { name: 'Log trade', exact: true }).first().click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Trading date').fill('2026-10-28');
  await dialog.getByLabel('Symbol', { exact: true }).fill('NVDA');
  await dialog.getByLabel('Net P&L (USD)').fill('200');
  await dialog.getByRole('button', { name: 'Save trade', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await page.goto('/dashboard/trades');
  await expect(page.getByRole('cell', { name: 'NVDA', exact: false }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Edit NVDA' }).click();
  await page.getByLabel('Trading date').fill('2026-10-27');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.goto('/dashboard/calendar');
  await expect(page.getByTestId('calendar-cell')).toHaveCount(42);
  await page.getByRole('button', { name: 'Previous month' }).click();
  await expect(page.getByTestId('calendar-cell')).toHaveCount(42);
  await page.getByRole('button', { name: 'Next month' }).click();
  await page.getByRole('button', { name: 'Today', exact: true }).click();
  await page.goto('/dashboard/settings');
  await page.getByLabel('Starting balance (USD)').fill('20000');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('Settings saved');
  await page.context().clearCookies({ name: 'tj_access' });
  await page.goto('/dashboard/trades');
  await expect(page.getByRole('heading', { name: 'Trades Log' })).toBeVisible();
  await page.getByRole('button', { name: 'Delete NVDA' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete trade', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Your next insight starts with a trade.' }),
  ).toBeVisible();
  await expect(page.locator('body')).toHaveJSProperty(
    'scrollWidth',
    await page.evaluate(() => document.documentElement.clientWidth),
  );
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login$/);
});

test('calendar changes green to neutral to red after trade mutations', async ({ page }) => {
  await page.goto('/signup');
  await page.getByLabel('Full name', { exact: true }).fill('Calendar Tester');
  const email = `calendar-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@example.com`;
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill('CalendarTest2026!');
  await page.getByRole('button', { name: 'Create your journal' }).click();
  await verifyEmail(page, email);
  await expect(page.getByRole('heading', { name: 'Dashboard Overview' })).toBeVisible();
  const today = await page.evaluate(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  for (const [symbol, pnl] of [
    ['WIN', '200'],
    ['LOSS', '-200'],
  ]) {
    await page.getByRole('button', { name: 'Log trade', exact: true }).first().click();
    const modal = page.getByRole('dialog');
    await modal.getByLabel('Trading date').fill(today);
    await modal.getByLabel('Symbol', { exact: true }).fill(symbol);
    await modal.getByLabel('Net P&L (USD)').fill(pnl);
    await modal.getByRole('button', { name: 'Save trade', exact: true }).click();
    await expect(modal).not.toBeVisible();
    await page.goto('/dashboard/calendar');
    const cell = page.getByRole('button', { name: new RegExp(`^${today},`) });
    await expect(cell).toHaveAttribute('data-outcome', symbol === 'WIN' ? 'positive' : 'flat');
  }
  await page.goto('/dashboard/trades');
  await page.getByRole('button', { name: 'Delete WIN', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete trade', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.goto('/dashboard/calendar');
  await expect(page.getByRole('button', { name: new RegExp(`^${today},`) })).toHaveAttribute(
    'data-outcome',
    'negative',
  );
  await page.getByRole('button', { name: new RegExp(`^${today},`) }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.goto('/dashboard/trades');
  await page.getByRole('button', { name: 'Delete LOSS', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete trade', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
});
