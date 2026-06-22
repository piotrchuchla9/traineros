import { test } from '@playwright/test'
import path from 'path'

const OUT = path.resolve(__dirname, '../screenshots')

async function shot(page: import('@playwright/test').Page, name: string) {
  await page.evaluate(() => {
    document.querySelectorAll('nextjs-portal').forEach(el => el.remove())
  })
  await page.waitForLoadState('networkidle')
  // Wait for all images to finish loading
  await page.waitForFunction(() => {
    const imgs = Array.from(document.querySelectorAll('img'))
    return imgs.every(img => img.complete)
  }, { timeout: 8000 }).catch(() => {})
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false })
  console.log(`✓ ${name}.png`)
}

// ── Trainer screens ──────────────────────────────────────────────────────────

test.use({ storageState: 'tests/.auth/trainer.json', viewport: { width: 1280, height: 800 } })

test('trainer screens', async ({ page }) => {
  // Force English UI
  await page.context().addCookies([{ name: 'lang', value: 'en', url: 'http://localhost:3000' }])

  // 01 – Dashboard with clients
  await page.goto('/dashboard')
  await shot(page, '01-dashboard')

  // 02 – Schedule calendar with sessions
  await page.goto('/schedule')
  await shot(page, '02-schedule-calendar')

  // 03 – Schedule list view (upcoming)
  await page.getByRole('button', { name: /lista|list/i }).first().click()
  await page.waitForTimeout(400)
  await shot(page, '03-schedule-list')

  // 04 – Client profile page (wait for avatar + progress signed URLs)
  await page.goto('/dashboard')
  await page.waitForLoadState('networkidle')
  await page.locator('a[href*="/clients/"]:not([href$="/new"])').first().click()
  await page.waitForURL(/\/clients\/\w/)
  await page.waitForSelector('h2', { timeout: 15_000 })
  await page.waitForTimeout(1200)
  await shot(page, '04-client-profile')

  // 05 – Training plan section (plan card visible above the fold)
  // already at top, plan is visible in the above screenshot

  // 06 – Client sessions section (scroll down)
  await page.evaluate(() => window.scrollTo({ top: 500, behavior: 'instant' }))
  await page.waitForTimeout(800)
  await shot(page, '05-client-sessions')

  // 07 – New session form drawer
  await page.goto('/schedule')
  await page.getByRole('button', { name: /\+ nowa sesja|\+ new session/i }).first().click()
  await page.waitForTimeout(600)
  await shot(page, '07-new-session-form')
  await page.keyboard.press('Escape')

  // 08 – Exercises library
  await page.goto('/exercises')
  await page.waitForLoadState('networkidle')
  await shot(page, '08-exercises')

  // 09s – Settings (English)
  await page.goto('/settings')
  await page.waitForLoadState('networkidle')
  await shot(page, '09-settings')

  // 09 – Progress section (chart + measurements) — Sarah Johnson
  await page.goto('/dashboard')
  await page.waitForLoadState('networkidle')
  await page.locator('a[href*="/clients/"]:not([href$="/new"])').first().click()
  await page.waitForURL(/\/clients\/\w/)
  await page.waitForSelector('h2', { timeout: 15_000 })
  await page.waitForTimeout(1200)
  // Scroll to "Photos & measurements" heading using Playwright locator
  const progressHeading = page.getByRole('heading', { name: /photos|measurements/i }).first()
  await progressHeading.scrollIntoViewIfNeeded()
  await page.waitForTimeout(600)
  // Take screenshot directly at current scroll position
  await page.evaluate(() => document.querySelectorAll('nextjs-portal').forEach(el => el.remove()))
  await page.screenshot({ path: `${OUT}/09-progress-chart.png`, fullPage: false })
  console.log('✓ 09-progress-chart.png')

  // 10 – Photo comparison dialog
  const compareBtn = page.getByRole('button', { name: /compare/i })
  if (await compareBtn.count() > 0) {
    await compareBtn.click()
    await page.waitForTimeout(300)
    // Progress entry cards are inside the ProgressTimeline — select them
    // Entries are shown newest-first; click last (oldest = Jan) then first (newest = Jun)
    const entryCards = page.locator('text=January').locator('..').locator('..')
    const allCards = page.getByText(/January|February|March|April|May|June/).locator('../..')
    // Simpler: click the last visible card-like element in the progress section
    const cardLocator = page.locator('[data-slot="card"]').filter({ hasText: /kg/i })
    const cardCount = await cardLocator.count()
    if (cardCount >= 2) {
      await cardLocator.last().click()   // Jan 10 (oldest)
      await page.waitForTimeout(200)
      await cardLocator.first().click()  // Jun 7 (newest)
      await page.waitForTimeout(1200)   // wait for before/after images to load
      await shot(page, '10-progress-comparison')
      await page.keyboard.press('Escape')
    }
  }
})

// ── Client portal screen ─────────────────────────────────────────────────────

test('client portal screen', async ({ browser }) => {
  const ctx = await browser.newContext({
    storageState: 'tests/.auth/client.json',
    viewport: { width: 1280, height: 800 },
  })
  const page = await ctx.newPage()
  await page.goto('/client')
  await page.waitForTimeout(1000)
  // Remove dev error overlay
  await page.evaluate(() => {
    document.querySelectorAll('nextjs-portal').forEach(el => el.remove())
  })
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: `${OUT}/10-client-portal.png`, fullPage: false })
  console.log('✓ 10-client-portal.png')
  await ctx.close()
})
