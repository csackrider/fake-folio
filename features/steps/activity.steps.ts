import { When, Then } from './fixtures'
import { ActivityPage } from '../../tests/pages/activity-page'

When('I search activity for {string}', async ({ page }, query: string) => {
  const activity = new ActivityPage(page)
  await activity.search(query)
})

Then('I see activity row containing {string}', async ({ page }, text: string) => {
  const activity = new ActivityPage(page)
  await activity.expectMerchantVisible(text)
})
