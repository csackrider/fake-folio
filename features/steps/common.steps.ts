import { expect } from '@playwright/test'
import { Given, When, Then } from './fixtures'
import { DashboardPage } from '../../tests/pages/dashboard-page'
import { Navigation } from '../../tests/pages/navigation'

Given('I open the home page', async ({ page }) => {
  const dashboard = new DashboardPage(page)
  await dashboard.goto()
})

Then('I see the dashboard root', async ({ page }) => {
  const dashboard = new DashboardPage(page)
  await dashboard.expectLoaded()
})

Then('I see the heading {string}', async ({ page }, text: string) => {
  const dashboard = new DashboardPage(page)
  await dashboard.expectHeading(text)
})

When('I navigate to {string} from the sidebar', async ({ page }, label: string) => {
  const nav = new Navigation(page)
  await nav.clickNav(label)
})

Then('I see the page title {string} in the main content', async ({ page }, title: string) => {
  await expect(
    page.getByRole('main').getByRole('heading', { level: 1, name: title })
  ).toBeVisible()
})
