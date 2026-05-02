import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class ActivityPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/activity')
  }

  async search(text: string): Promise<void> {
    await this.page.getByTestId('activity-search').fill(text)
  }

  async expectMerchantVisible(merchant: string): Promise<void> {
    await expect(this.page.getByRole('main').getByText(merchant, { exact: false }).first()).toBeVisible()
  }
}
