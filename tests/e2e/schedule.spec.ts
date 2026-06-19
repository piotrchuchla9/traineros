import { test, expect } from '@playwright/test'

test.describe('Grafik', () => {
  test('ładuje się z widokiem kalendarza', async ({ page }) => {
    await page.goto('/schedule')
    await expect(page.getByRole('button', { name: /kalendarz|calendar/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /lista|list/i })).toBeVisible()
  })

  test('nawigacja między miesiącami działa', async ({ page }) => {
    await page.goto('/schedule')
    const heading = page.locator('h2').first()
    const initialText = await heading.textContent()
    await page.getByRole('button', { name: '→' }).click()
    await expect(heading).not.toHaveText(initialText ?? '')
  })

  test('przycisk Dziś wraca do bieżącego miesiąca', async ({ page }) => {
    await page.goto('/schedule')
    const heading = page.locator('h2').first()
    const initialText = await heading.textContent()
    await page.getByRole('button', { name: '→' }).click()
    await page.getByRole('button', { name: /dziś|today/i }).click()
    await expect(heading).toHaveText(initialText ?? '')
  })

  test('przełącznik Lista działa', async ({ page }) => {
    await page.goto('/schedule')
    await page.getByRole('button', { name: /lista|list/i }).click()
    await expect(page.getByRole('button', { name: /nadchodzące|upcoming/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /historia|history/i })).toBeVisible()
  })

  test('filtry w widoku listy działają', async ({ page }) => {
    await page.goto('/schedule')
    await page.getByRole('button', { name: /lista|list/i }).click()
    // Filtr klienta
    await expect(page.getByText(/wszyscy klienci|all clients/i)).toBeVisible()
    // Filtr lokalizacji
    await expect(page.getByText(/wszystkie lokalizacje|all locations/i)).toBeVisible()
    // Filtr płatności
    await expect(page.getByText(/płatność|payment/i)).toBeVisible()
  })

  test('można otworzyć formularz nowej sesji', async ({ page }) => {
    await page.goto('/schedule')
    await page.getByRole('button', { name: /\+ nowa sesja|\+ new session/i }).first().click()
    await expect(page.getByRole('heading', { name: /nowa sesja|new session/i })).toBeVisible()
    // Wymagane pola są oznaczone
    await expect(page.getByText(/klient|client/i).first()).toBeVisible()
    await expect(page.getByText('*').first()).toBeVisible()
  })

  test('switch Online działa w formularzu sesji', async ({ page }) => {
    await page.goto('/schedule')
    await page.getByRole('button', { name: /\+ nowa sesja|\+ new session/i }).first().click()
    const onlineSwitch = page.getByRole('switch', { name: /online/i })
    await expect(onlineSwitch).toBeVisible()
    await onlineSwitch.click()
    await expect(onlineSwitch).toHaveAttribute('aria-checked', 'true')
  })

  test('walidacja formularza sesji działa', async ({ page }) => {
    await page.goto('/schedule')
    await page.getByRole('button', { name: /\+ nowa sesja|\+ new session/i }).first().click()
    // Wyczyść godzinę i kliknij zapisz
    await page.getByRole('button', { name: /zapisz|save/i }).first().click()
    // Powinien pojawić się błąd walidacji
    await expect(page.getByText(/wpisz godzinę|enter time|wybierz|lokalizację/i)).toBeVisible({ timeout: 5_000 })
  })
})
