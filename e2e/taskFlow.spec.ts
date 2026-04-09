import { test, expect, _electron as electron } from '@playwright/test';
import path from 'path';

test('launches and shows login screen', async () => {
  const app = await electron.launch({ args: [path.join(__dirname, '../dist/main.js')] });
  const window = await app.firstWindow();
  await expect(window.locator('text=Sign in with Google')).toBeVisible();
  await app.close();
});
