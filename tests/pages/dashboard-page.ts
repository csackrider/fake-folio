import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class DashboardPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/')
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page.getByTestId('dashboard-root')).toBeVisible()
  }

  async expectHeading(text: string): Promise<void> {
    const byTestId = this.page.getByTestId('dashboard-heading')
    if (text === 'Dashboard') {
      await expect(byTestId).toHaveText('Dashboard')
      return
    }
    await expect(this.page.getByRole('heading', { name: text })).toBeVisible()
  }

  async openAddEntry(): Promise<void> {
    await this.page.getByRole('button', { name: 'Add Entry' }).click()
    await expect(this.page.getByRole('dialog', { name: 'Add Entry' })).toBeVisible()
  }

  async submitNewEntry(merchant: string, amount: string): Promise<void> {
    await this.page.getByLabel('Merchant').fill(merchant)
    await this.page.getByLabel('Amount').fill(amount)
    await this.page.getByTestId('add-entry-submit').click()
    await expect(this.page.getByRole('dialog', { name: 'Add Entry' })).toBeHidden()
  }
}
