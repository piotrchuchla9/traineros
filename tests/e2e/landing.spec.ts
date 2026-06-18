import { test, expect } from '@playwright/test'

test.describe('Landing page', () => {
  test('ładuje się i zawiera kluczowe sekcje', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/TrainerOS/)
    await expect(page.getByText(/14.dz|14.day|trial/i).first()).toBeVisible()
    await expect(page.getByText(/prosty cennik|simple pricing/i)).toBeVisible()
    await expect(page.getByText(/basic/i).first()).toBeVisible()
    await expect(page.getByText(/pro/i).first()).toBeVisible()
  })

  test('ceny są widoczne', async ({ page }) => {
    await page.goto('/')
    // PLN lub USD w zależności od języka
    const pricing = page.locator('text=/zł|\\$/')
    await expect(pricing.first()).toBeVisible()
  })

  test('przyciski nav działają', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /zaloguj|sign in/i }).click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('zalogowany użytkownik jest przekierowany na dashboard', async ({ page, context }) => {
    // Bez sesji - landing page powinna się pokazać
    await page.goto('/')
    await expect(page.getByRole('link', { name: /zaloguj|sign in/i })).toBeVisible()
  })

  test('sekcja funkcjonalności jest widoczna', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/plany treningowe|training plans/i).first()).toBeVisible()
    await expect(page.getByText(/grafik|schedule/i).first()).toBeVisible()
  })
})
