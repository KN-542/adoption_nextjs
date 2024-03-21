import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('https://www.google.com/', { waitUntil: 'load' });


    // Expect a title "to contain" a substring.
    // await expect(page).toHaveTitle(/404: This page could not be found/);
});

// test('sign in exist', async ({ page }) => {
//   await page.goto('http://host.docker.internal:3000/management/login');

//   // Click the get started link.
//   await page.getByRole('link', { name: 'サインイン' }).click();

//   // Expects page to have a heading with the name of Installation.
//   await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
// });
