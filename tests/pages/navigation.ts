import type { Page } from '@playwright/test'

export class Navigation {
  constructor(private readonly page: Page) {}

  /** Clicks a sidebar nav item by visible label (e.g. Home, Budget, Settings). */
  async clickNav(label: string): Promise<void> {
    await this.page
      .locator('aside')
      .getByRole('navigation')
      .getByRole('button', { name: label, exact: true })
      .click()
  }
}
