import { test as setup, expect } from '@playwright/test'
import path from 'path'

const authFile = path.join(__dirname, '../.auth/trainer.json')

setup('zaloguj trenera', async ({ page }) => {
  const email = process.env.E2E_TRAINER_EMAIL
  const password = process.env.E2E_TRAINER_PASSWORD
  if (!email || !password) throw new Error('Brak E2E_TRAINER_EMAIL lub E2E_TRAINER_PASSWORD w .env.local')

  await page.goto('/login')
  await page.getByRole('textbox', { name: /email/i }).fill(email)
  await page.getByRole('textbox', { name: /hasło|password/i }).fill(password)
  await page.getByRole('button', { name: /zaloguj|sign in|log in/i }).click()

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 })
  await page.context().storageState({ path: authFile })
})
