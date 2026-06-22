import { chromium } from '@playwright/test'

const browser = await chromium.launch()
const ctx = await browser.newContext({ storageState: './tests/.auth/trainer.json' })
const page = await ctx.newPage()
await ctx.addCookies([{ name: 'lang', value: 'en', url: 'http://localhost:3000' }])
await page.goto('http://localhost:3000/dashboard')
await page.waitForLoadState('networkidle')
const link = page.locator('a[href*="/clients/"]:not([href$="/new"])').first()
await link.click()
await page.waitForSelector('h2', { timeout: 15000 })
await page.waitForTimeout(2000)
const imgData = await page.evaluate(() =>
  Array.from(document.querySelectorAll('img')).map(img => ({
    src: img.src?.slice(0, 120), complete: img.complete, naturalW: img.naturalWidth
  }))
)
console.log(JSON.stringify(imgData.slice(0, 8), null, 2))
await browser.close()
