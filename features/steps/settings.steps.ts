import { When, Then } from './fixtures'
import { SettingsPage } from '../../tests/pages/settings-page'

When('I set the appearance theme to {string}', async ({ page }, theme: string) => {
  const settings = new SettingsPage(page)
  const label = theme as 'Light' | 'Dark' | 'System'
  if (label !== 'Light' && label !== 'Dark' && label !== 'System') {
    throw new Error(`Unsupported theme: ${theme}`)
  }
  await settings.setTheme(label)
})

When('I save settings', async ({ page }) => {
  const settings = new SettingsPage(page)
  await settings.save()
})

Then('the document uses dark appearance', async ({ page }) => {
  const settings = new SettingsPage(page)
  await settings.expectHtmlThemeDark()
})
