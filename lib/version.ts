export const APP_VERSION = "1.0.0"

export type ChangelogEntry = {
  version: string
  date: string
  title: string
  changes: string[]
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.0.0",
    date: "2026-04-21",
    title: "Major Feature Release",
    changes: [
      "Goals: Track savings goals, debt payoff, and sinking funds with contribution history",
      "Net Worth: Monitor assets and liabilities with monthly snapshots and trend charts",
      "Splits: Settlement calculator for shared expenses - see who owes whom",
      "Enhanced Insights: Spending trends, savings rate, anomaly detection, and budget rollover tracking",
      "Month Review: End-of-month recap with key metrics and highlights",
      "Bill Reminders: See upcoming recurring charges on your dashboard",
      "Quick Entry: Press Cmd/Ctrl+N anywhere to add an entry instantly",
      "Entry Comments: Add notes and discussions to individual transactions",
      "PWA Support: Install FakeFolio as an app on your device",
      "Cloud Sync: Optional Supabase integration for cross-device sync",
    ],
  },
]

export function getLatestVersion(): string {
  return APP_VERSION
}

export function getChangesSinceVersion(lastSeenVersion: string | null): ChangelogEntry[] {
  if (!lastSeenVersion) return CHANGELOG
  
  const result: ChangelogEntry[] = []
  for (const entry of CHANGELOG) {
    if (compareVersions(entry.version, lastSeenVersion) > 0) {
      result.push(entry)
    }
  }
  return result
}

// Simple semver comparison: returns positive if a > b, negative if a < b, 0 if equal
function compareVersions(a: string, b: string): number {
  const partsA = a.split(".").map(Number)
  const partsB = b.split(".").map(Number)
  
  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const numA = partsA[i] || 0
    const numB = partsB[i] || 0
    if (numA !== numB) return numA - numB
  }
  return 0
}
