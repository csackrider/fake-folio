import { When } from './fixtures'
import { DashboardPage } from '../../tests/pages/dashboard-page'

When(
  'I add a new expense entry for merchant {string} with amount {string}',
  async ({ page }, merchant: string, amount: string) => {
    const dashboard = new DashboardPage(page)
    await dashboard.openAddEntry()
    await dashboard.submitNewEntry(merchant, amount)
  }
)
