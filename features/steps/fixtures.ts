import { test as base, createBdd } from 'playwright-bdd'
import { APP_VERSION } from '../../lib/version'

/**
 * Prime localStorage before any document loads so the What's New dialog does not block E2E.
 * See components/whats-new-dialog.tsx and lib/version.ts.
 */
export const test = base.extend({
  context: async ({ context }, use) => {
    await context.addInitScript((version: string) => {
      try {
        localStorage.setItem('fakefolio-last-seen-version', version)
      } catch {
        /* ignore */
      }
    }, APP_VERSION)
    await use(context)
  },
})

export const { Given, When, Then } = createBdd(test)
