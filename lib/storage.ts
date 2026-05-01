import type {
  Entry,
  BudgetCategory,
  AppSettings,
  HouseholdMember,
  Goal,
  NetWorthItem,
  NetWorthSnapshot,
  EntryComment,
} from "./types"
import { generateMockEntries } from "./mock-data"
import { DEFAULT_BUDGET_CATEGORIES } from "./constants"

const ENTRIES_KEY = "tallyr-entries"
const BUDGET_KEY = "tallyr-budget"
const SETTINGS_KEY = "tallyr-settings"
const GOALS_KEY = "tallyr-goals"
const NET_WORTH_ITEMS_KEY = "tallyr-networth-items"
const NET_WORTH_SNAPSHOTS_KEY = "tallyr-networth-snapshots"
const COMMENTS_KEY = "tallyr-comments"

// Old keys from before the rename
const OLD_ENTRIES_KEY = "calm-ledger-entries"
const OLD_BUDGET_KEY = "calm-ledger-budget"
const OLD_SETTINGS_KEY = "calm-ledger-settings"

// Migrate data from old calm-ledger-* keys to tallyr-* keys
function migrateOldKeys(): void {
  if (typeof window === "undefined") return

  const migrations = [
    { old: OLD_ENTRIES_KEY, new: ENTRIES_KEY },
    { old: OLD_BUDGET_KEY, new: BUDGET_KEY },
    { old: OLD_SETTINGS_KEY, new: SETTINGS_KEY },
  ]

  for (const { old: oldKey, new: newKey } of migrations) {
    const oldData = localStorage.getItem(oldKey)
    const newData = localStorage.getItem(newKey)
    // Only migrate if old data exists and new key doesn't have real data yet
    if (oldData && !newData) {
      localStorage.setItem(newKey, oldData)
      localStorage.removeItem(oldKey)
    }
  }
}

const DEFAULT_MEMBERS: HouseholdMember[] = [
  { id: "person-1", name: "Person 1" },
  { id: "person-2", name: "Person 2" },
]

const DEFAULT_SETTINGS: AppSettings = {
  currency: "USD",
  theme: "light",
  members: DEFAULT_MEMBERS,
}

// Migration helper: convert old "person1"/"person2" to new "person-1"/"person-2" IDs
function migrateAssignedTo(assignedTo: string): string {
  if (assignedTo === "person1") return "person-1"
  if (assignedTo === "person2") return "person-2"
  return assignedTo
}

export function loadEntries(): Entry[] {
  if (typeof window === "undefined") return []
  migrateOldKeys()
  const raw = localStorage.getItem(ENTRIES_KEY)
  if (raw) {
    try {
      const entries = JSON.parse(raw) as Entry[]
      // Migrate old assignedTo values
      let needsMigration = false
      const migrated = entries.map((e) => {
        const newAssigned = migrateAssignedTo(e.assignedTo)
        if (newAssigned !== e.assignedTo) needsMigration = true
        return { ...e, assignedTo: newAssigned }
      })
      if (needsMigration) {
        localStorage.setItem(ENTRIES_KEY, JSON.stringify(migrated))
      }
      return migrated
    } catch {
      return []
    }
  }
  // First load: seed mock data
  const mock = generateMockEntries()
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(mock))
  return mock
}

export function saveEntries(entries: Entry[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries))
}

export function loadBudgetCategories(): BudgetCategory[] {
  if (typeof window === "undefined") return []
  migrateOldKeys()
  const raw = localStorage.getItem(BUDGET_KEY)
  if (raw) {
    try {
      return JSON.parse(raw)
    } catch {
      return []
    }
  }
  // First load: seed defaults
  localStorage.setItem(BUDGET_KEY, JSON.stringify(DEFAULT_BUDGET_CATEGORIES))
  return [...DEFAULT_BUDGET_CATEGORIES]
}

export function saveBudgetCategories(categories: BudgetCategory[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(BUDGET_KEY, JSON.stringify(categories))
}

// Type for old settings format with personNames tuple
type OldSettings = {
  currency?: string
  theme?: string
  personNames?: [string, string]
}

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS
  migrateOldKeys()
  const raw = localStorage.getItem(SETTINGS_KEY)
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as OldSettings & Partial<AppSettings>
      
      // Migrate old personNames tuple to new members array
      if (parsed.personNames && !parsed.members) {
        const migratedMembers: HouseholdMember[] = [
          { id: "person-1", name: parsed.personNames[0] || "Person 1" },
          { id: "person-2", name: parsed.personNames[1] || "Person 2" },
        ]
        const migrated: AppSettings = {
          currency: (parsed.currency as AppSettings["currency"]) || DEFAULT_SETTINGS.currency,
          theme: (parsed.theme as AppSettings["theme"]) || DEFAULT_SETTINGS.theme,
          members: migratedMembers,
        }
        // Save migrated settings
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(migrated))
        return migrated
      }
      
      return { ...DEFAULT_SETTINGS, ...parsed }
    } catch {
      return DEFAULT_SETTINGS
    }
  }
  return DEFAULT_SETTINGS
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === "undefined") return
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

// Goals
export function loadGoals(): Goal[] {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(GOALS_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as Goal[]
  } catch {
    return []
  }
}

export function saveGoals(goals: Goal[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals))
}

// Net Worth items
export function loadNetWorthItems(): NetWorthItem[] {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(NET_WORTH_ITEMS_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as NetWorthItem[]
  } catch {
    return []
  }
}

export function saveNetWorthItems(items: NetWorthItem[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(NET_WORTH_ITEMS_KEY, JSON.stringify(items))
}

// Net Worth snapshots
export function loadNetWorthSnapshots(): NetWorthSnapshot[] {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(NET_WORTH_SNAPSHOTS_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as NetWorthSnapshot[]
  } catch {
    return []
  }
}

export function saveNetWorthSnapshots(snapshots: NetWorthSnapshot[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(NET_WORTH_SNAPSHOTS_KEY, JSON.stringify(snapshots))
}

// Entry comments
export function loadEntryComments(): EntryComment[] {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(COMMENTS_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as EntryComment[]
  } catch {
    return []
  }
}

export function saveEntryComments(comments: EntryComment[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments))
}

// Check if there's local data to migrate (non-mock entries)
export function hasLocalDataToMigrate(): boolean {
  if (typeof window === "undefined") return false
  const raw = localStorage.getItem(ENTRIES_KEY)
  if (!raw) return false
  try {
    const entries = JSON.parse(raw) as Entry[]
    // Has entries that aren't mock data (check if more than default mock count or modified)
    return entries.length > 0
  } catch {
    return false
  }
}
