import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export class SettingsPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/settings')
  }

  async setTheme(theme: 'Light' | 'Dark' | 'System'): Promise<void> {
    await this.page.locator('#theme-select').click()
    await this.page.getByRole('option', { name: theme, exact: true }).click()
  }

  async save(): Promise<void> {
    await this.page.getByTestId('settings-save').click()
  }

  async expectHtmlThemeDark(): Promise<void> {
    await expect(this.page.locator('html')).toHaveClass(/dark/)
  }
}
