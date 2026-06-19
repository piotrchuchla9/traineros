import { test, expect } from '@playwright/test'

test.describe('Portal klienta', () => {
  test('dashboard klienta ładuje się', async ({ page }) => {
    await page.goto('/client')
    await expect(page).toHaveURL(/\/client/)
    await expect(page.getByText(/TrainerOS/i)).toBeVisible()
  })

  test('widać sekcję nadchodzące treningi lub plany', async ({ page }) => {
    await page.goto('/client')
    // Przynajmniej jedna z tych sekcji powinna być widoczna
    const upcoming = page.getByText(/nadchodzące treningi|upcoming sessions/i)
    const plans = page.getByText(/moje plany|my.*plan/i)
    const progress = page.getByText(/moje postępy|my progress/i)
    await expect(upcoming.or(plans).or(progress).first()).toBeVisible()
  })

  test('przycisk wyloguj jest widoczny', async ({ page }) => {
    await page.goto('/client')
    await expect(page.getByRole('button', { name: /wyloguj|log out/i })).toBeVisible()
  })

  test('przycisk zmień hasło jest widoczny', async ({ page }) => {
    await page.goto('/client')
    await expect(page.getByRole('button', { name: /zmień hasło|change password/i }).first()).toBeVisible()
  })

  test('niezalogowany klient jest przekierowany', async ({ page, context }) => {
    await context.clearCookies()
    await page.goto('/client')
    await expect(page).toHaveURL(/\/login/, { timeout: 8_000 })
  })

  test('wylogowanie działa', async ({ page }) => {
    await page.goto('/client')
    await page.getByRole('button', { name: /wyloguj|log out/i }).click()
    await expect(page).toHaveURL(/\/login/, { timeout: 8_000 })
  })
})
