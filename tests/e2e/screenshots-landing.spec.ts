import { test } from '@playwright/test'
import path from 'path'

// Runs in 'public' project — no auth session
const OUT = path.resolve(__dirname, '../screenshots')

test.use({ viewport: { width: 1280, height: 800 } })

test('landing page screenshots', async ({ page }) => {
  // Set lang=en cookie so landing page renders in English
  await page.context().addCookies([{ name: 'lang', value: 'en', url: 'http://localhost:3000' }])

  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: `${OUT}/11-landing-hero.png` })
  console.log('✓ 11-landing-hero.png')

  await page.locator('#cennik').scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${OUT}/12-landing-pricing.png` })
  console.log('✓ 12-landing-pricing.png')
})
