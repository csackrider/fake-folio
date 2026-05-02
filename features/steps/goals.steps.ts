import { Given, Then } from './fixtures'
import { expect } from '@playwright/test'

Given('I have cleared saved goals from storage', async ({ page }) => {
  await page.addInitScript(() => {
    try {
      localStorage.removeItem('fakefolio-goals')
    } catch {
      /* ignore */
    }
  })
})

Then('I see the goals empty state', async ({ page }) => {
  const main = page.getByRole('main')
  await expect(main.getByRole('heading', { name: 'No goals yet' })).toBeVisible()
  await expect(main.getByRole('button', { name: 'Create your first goal' })).toBeVisible()
})
