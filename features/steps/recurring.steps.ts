import { Then } from './fixtures'
import { expect } from '@playwright/test'

Then('I see recurring seed merchant {string}', async ({ page }, merchant: string) => {
  await expect(page.getByRole('main').getByText(merchant, { exact: false }).first()).toBeVisible()
})
