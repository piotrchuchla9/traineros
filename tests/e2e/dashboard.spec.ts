import { test, expect } from '@playwright/test'

test.describe('Dashboard trenera', () => {
  test('ładuje się po zalogowaniu', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.getByText(/klienci|clients/i).first()).toBeVisible()
  })

  test('nawigacja działa', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByRole('link', { name: /schedule|grafik/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /exercises|ćwiczenia/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /settings|ustawienia/i })).toBeVisible()
  })

  test('sekcja nadchodzące sesje jest widoczna', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText(/nadchodzące sesje|upcoming sessions/i)).toBeVisible()
  })

  test('przycisk dodaj klienta istnieje', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByRole('link', { name: /dodaj klienta|add client/i })).toBeVisible()
  })

  test('niezalogowany jest przekierowany', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/, { timeout: 8_000 })
  })
})
