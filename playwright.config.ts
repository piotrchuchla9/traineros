import { defineConfig, devices } from '@playwright/test'
import { config } from 'dotenv'
import path from 'path'

config({ path: path.resolve(__dirname, '.env.local') })

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: 1,
  timeout: 30_000,
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // 1. Login raz i zapisz sesje
    { name: 'setup-trainer', testMatch: /trainer\.setup\.ts/ },
    { name: 'setup-client', testMatch: /client\.setup\.ts/ },
    // 2. Testy korzystają z zapisanych sesji
    {
      name: 'trainer',
      use: { ...devices['Desktop Chrome'], storageState: 'tests/.auth/trainer.json' },
      dependencies: ['setup-trainer'],
      testIgnore: /.*setup\.ts|client-portal\.spec\.ts|landing\.spec\.ts/,
    },
    {
      name: 'client-portal',
      use: { ...devices['Desktop Chrome'], storageState: 'tests/.auth/client.json' },
      dependencies: ['setup-client'],
      testMatch: /client-portal\.spec\.ts/,
    },
    // Landing page — bez sesji
    {
      name: 'public',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /landing\.spec\.ts|screenshots-landing\.spec\.ts/,
    },
  ],
})
