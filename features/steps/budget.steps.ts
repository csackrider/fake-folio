import { Then } from './fixtures'
import { expect } from '@playwright/test'

Then('I see default budget category {string} in the main content', async ({ page }, name: string) => {
  await expect(page.getByRole('main').getByText(name, { exact: true }).first()).toBeVisible()
})
