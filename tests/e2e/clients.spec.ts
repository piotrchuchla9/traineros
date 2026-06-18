import { test, expect } from '@playwright/test'

test.describe('Klienci', () => {
  test('lista klientów ładuje się', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByText(/klienci|clients/i).first()).toBeVisible()
  })

  test('można przejść do profilu klienta', async ({ page }) => {
    await page.goto('/dashboard')
    // Kliknij pierwszą kartę klienta jeśli istnieje
    const clientCard = page.locator('a[href*="/clients/"]').first()
    const hasClients = await clientCard.count() > 0
    if (!hasClients) {
      test.skip() // brak klientów - pomiń
      return
    }
    await clientCard.click()
    await expect(page).toHaveURL(/\/clients\//)
    await expect(page.getByText(/plany treningowe|training plans/i)).toBeVisible()
    await expect(page.getByText(/sesje treningowe|training sessions/i)).toBeVisible()
  })

  test('strona klienta ma sekcję sesji', async ({ page }) => {
    await page.goto('/dashboard')
    const clientCard = page.locator('a[href*="/clients/"]').first()
    if (await clientCard.count() === 0) { test.skip(); return }
    await clientCard.click()
    await expect(page.getByText(/sesje treningowe|training sessions/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /nadchodzące|upcoming/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /historia|history/i })).toBeVisible()
  })

  test('formularz dodawania klienta otwiera się', async ({ page }) => {
    await page.goto('/clients/new')
    await expect(page.getByRole('textbox', { name: /imię|name/i })).toBeVisible()
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible()
  })

  test('walidacja formularza klienta działa', async ({ page }) => {
    await page.goto('/clients/new')
    await page.getByRole('button', { name: /zapisz|save|dodaj|add/i }).click()
    // Puste imię nie powinno przejść
    await expect(page.getByRole('textbox', { name: /imię|name/i })).toBeFocused()
  })
})
