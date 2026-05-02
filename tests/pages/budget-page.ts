import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class BudgetPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/budget')
  }

  async expectDefaultCategoryVisible(): Promise<void> {
    await expect(this.page.getByRole('main').getByText('Rent / Mortgage')).toBeVisible()
  }
}
