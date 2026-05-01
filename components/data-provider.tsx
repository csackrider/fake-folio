"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react"
import type {
  Entry,
  BudgetCategory,
  CurrencyCode,
  Theme,
  PersonFilter,
  HouseholdMember,
  AppSettings,
  Goal,
  NetWorthItem,
  NetWorthSnapshot,
  EntryComment,
} from "@/lib/types"
import {
  loadEntries,
  saveEntries,
  loadBudgetCategories,
  saveBudgetCategories,
  loadSettings,
  saveSettings,
  loadGoals,
  saveGoals,
  loadNetWorthItems,
  saveNetWorthItems,
  loadNetWorthSnapshots,
  saveNetWorthSnapshots,
  loadEntryComments,
  saveEntryComments,
} from "@/lib/storage"
import { formatCurrency } from "@/lib/finance"
import { useAuth } from "@/components/auth-provider"
import {
  getEntries as getCloudEntries,
  saveEntry as saveCloudEntry,
  deleteEntry as deleteCloudEntry,
  saveAllEntries as saveAllCloudEntries,
  getBudgetCategories as getCloudBudgets,
  saveBudgetCategory as saveCloudBudget,
  deleteBudgetCategory as deleteCloudBudget,
  saveAllBudgetCategories as saveAllCloudBudgets,
  getSettings as getCloudSettings,
  saveSettings as saveCloudSettings,
  checkCloudMode,
} from "@/lib/supabase/data"

type DataContextType = {
  entries: Entry[]
  filteredEntries: Entry[]
  budgetCategories: BudgetCategory[]
  currency: CurrencyCode
  setCurrency: (code: CurrencyCode) => void
  theme: Theme
  setTheme: (theme: Theme) => void
  members: HouseholdMember[]
  setMembers: (members: HouseholdMember[]) => void
  personFilter: PersonFilter
  setPersonFilter: (filter: PersonFilter) => void
  saveAllSettings: (settings: AppSettings) => void
  formatAmount: (amount: number) => string
  addEntry: (entry: Entry) => void
  updateEntry: (entry: Entry) => void
  deleteEntries: (ids: string[]) => void
  importEntries: (newEntries: Entry[]) => void
  updateBudgetCategory: (category: BudgetCategory) => void
  addBudgetCategory: (category: BudgetCategory) => void
  deleteBudgetCategory: (id: string) => void
  getBackupData: () => {
    entries: Entry[]
    budgetCategories: BudgetCategory[]
    settings: AppSettings
    goals?: Goal[]
    netWorthItems?: NetWorthItem[]
    netWorthSnapshots?: NetWorthSnapshot[]
    comments?: EntryComment[]
  }
  restoreBackup: (data: {
    entries: Entry[]
    budgetCategories: BudgetCategory[]
    settings: AppSettings
    goals?: Goal[]
    netWorthItems?: NetWorthItem[]
    netWorthSnapshots?: NetWorthSnapshot[]
    comments?: EntryComment[]
  }) => void
  isLoaded: boolean
  isCloudMode: boolean
  migrateLocalDataToCloud: () => Promise<boolean>
  // Goals
  goals: Goal[]
  addGoal: (goal: Goal) => void
  updateGoal: (goal: Goal) => void
  deleteGoal: (id: string) => void
  // Net worth
  netWorthItems: NetWorthItem[]
  addNetWorthItem: (item: NetWorthItem) => void
  updateNetWorthItem: (item: NetWorthItem) => void
  deleteNetWorthItem: (id: string) => void
  netWorthSnapshots: NetWorthSnapshot[]
  addNetWorthSnapshot: (snapshot: NetWorthSnapshot) => void
  deleteNetWorthSnapshot: (id: string) => void
  // Comments
  entryComments: EntryComment[]
  addEntryComment: (comment: EntryComment) => void
  deleteEntryComment: (id: string) => void
}

const DataContext = createContext<DataContextType | null>(null)

const DEFAULT_MEMBERS: HouseholdMember[] = [
  { id: "person-1", name: "Person 1" },
  { id: "person-2", name: "Person 2" },
]

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, isAuthEnabled } = useAuth()
  const [entries, setEntries] = useState<Entry[]>([])
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([])
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD")
  const [theme, setThemeState] = useState<Theme>("light")
  const [members, setMembersState] = useState<HouseholdMember[]>(DEFAULT_MEMBERS)
  const [personFilter, setPersonFilter] = useState<PersonFilter>("all")
  const [isLoaded, setIsLoaded] = useState(false)
  const [isCloudMode, setIsCloudMode] = useState(false)
  const [goals, setGoals] = useState<Goal[]>([])
  const [netWorthItems, setNetWorthItems] = useState<NetWorthItem[]>([])
  const [netWorthSnapshots, setNetWorthSnapshots] = useState<NetWorthSnapshot[]>([])
  const [entryComments, setEntryComments] = useState<EntryComment[]>([])

  const applyTheme = useCallback((t: Theme) => {
    const root = document.documentElement
    if (t === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      root.classList.toggle("dark", prefersDark)
    } else {
      root.classList.toggle("dark", t === "dark")
    }
  }, [])

  useEffect(() => {
    async function loadData() {
      if (isAuthEnabled && user) {
        const cloudAvailable = await checkCloudMode()
        setIsCloudMode(cloudAvailable)

        if (cloudAvailable) {
          const [cloudEntries, cloudBudgets, cloudSettings] = await Promise.all([
            getCloudEntries(),
            getCloudBudgets(),
            getCloudSettings(),
          ])

          setEntries(cloudEntries)
          setBudgetCategories(cloudBudgets)
          if (cloudSettings) {
            setCurrencyState(cloudSettings.currency)
            setThemeState(cloudSettings.theme)
            setMembersState(cloudSettings.members?.length ? cloudSettings.members : DEFAULT_MEMBERS)
            applyTheme(cloudSettings.theme)
          } else {
            const localSettings = loadSettings()
            setCurrencyState(localSettings.currency)
            setThemeState(localSettings.theme)
            setMembersState(localSettings.members ?? DEFAULT_MEMBERS)
            applyTheme(localSettings.theme)
          }
        } else {
          setEntries(loadEntries())
          setBudgetCategories(loadBudgetCategories())
          const settings = loadSettings()
          setCurrencyState(settings.currency)
          setThemeState(settings.theme)
          setMembersState(settings.members ?? DEFAULT_MEMBERS)
          applyTheme(settings.theme)
        }
      } else {
        setEntries(loadEntries())
        setBudgetCategories(loadBudgetCategories())
        const settings = loadSettings()
        setCurrencyState(settings.currency)
        setThemeState(settings.theme)
        setMembersState(settings.members ?? DEFAULT_MEMBERS)
        applyTheme(settings.theme)
      }

      // Load local-only data: goals, net worth, comments
      // (These stay in localStorage for now; cloud sync can be added later)
      setGoals(loadGoals())
      setNetWorthItems(loadNetWorthItems())
      setNetWorthSnapshots(loadNetWorthSnapshots())
      setEntryComments(loadEntryComments())

      setIsLoaded(true)
    }

    loadData()
  }, [applyTheme, isAuthEnabled, user])

  useEffect(() => {
    if (theme !== "system") return
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => applyTheme("system")
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [theme, applyTheme])

  const currentSettings = useCallback(
    (): AppSettings => ({ currency, theme, members }),
    [currency, theme, members]
  )

  const setCurrency = useCallback(
    (code: CurrencyCode) => {
      setCurrencyState(code)
      const newSettings = { ...currentSettings(), currency: code }
      if (isCloudMode) {
        saveCloudSettings(newSettings)
      } else {
        saveSettings(newSettings)
      }
    },
    [currentSettings, isCloudMode]
  )

  const setTheme = useCallback(
    (t: Theme) => {
      setThemeState(t)
      applyTheme(t)
      const newSettings = { ...currentSettings(), theme: t }
      if (isCloudMode) {
        saveCloudSettings(newSettings)
      } else {
        saveSettings(newSettings)
      }
    },
    [currentSettings, applyTheme, isCloudMode]
  )

  const setMembers = useCallback(
    (m: HouseholdMember[]) => {
      setMembersState(m)
      const newSettings = { ...currentSettings(), members: m }
      if (isCloudMode) {
        saveCloudSettings(newSettings)
      } else {
        saveSettings(newSettings)
      }
    },
    [currentSettings, isCloudMode]
  )

  const saveAllSettingsCallback = useCallback(
    (s: AppSettings) => {
      setCurrencyState(s.currency)
      setThemeState(s.theme)
      setMembersState(s.members)
      applyTheme(s.theme)
      if (isCloudMode) {
        saveCloudSettings(s)
      } else {
        saveSettings(s)
      }
    },
    [applyTheme, isCloudMode]
  )

  const formatAmount = useCallback(
    (amount: number) => formatCurrency(amount, currency),
    [currency]
  )

  const filteredEntries = useMemo(() => {
    if (personFilter === "all") return entries

    const memberCount = members.length || 1

    return entries
      .filter((e) => {
        const assigned = e.assignedTo ?? "shared"
        return assigned === personFilter || assigned === "shared"
      })
      .map((e) => {
        const assigned = e.assignedTo ?? "shared"
        if (assigned !== "shared") return e
        const splitAmount = e.amount / memberCount
        return { ...e, amount: Math.round(splitAmount * 100) / 100 }
      })
  }, [entries, personFilter, members.length])

  const persistEntries = useCallback(
    (updated: Entry[]) => {
      setEntries(updated)
      if (!isCloudMode) {
        saveEntries(updated)
      }
    },
    [isCloudMode]
  )

  const persistBudget = useCallback(
    (updated: BudgetCategory[]) => {
      setBudgetCategories(updated)
      if (!isCloudMode) {
        saveBudgetCategories(updated)
      }
    },
    [isCloudMode]
  )

  const addEntry = useCallback(
    (entry: Entry) => {
      const updated = [...entries, entry]
      persistEntries(updated)
      if (isCloudMode) {
        saveCloudEntry(entry)
      }
    },
    [entries, persistEntries, isCloudMode]
  )

  const updateEntry = useCallback(
    (entry: Entry) => {
      const updated = entries.map((e) => (e.id === entry.id ? entry : e))
      persistEntries(updated)
      if (isCloudMode) {
        saveCloudEntry(entry)
      }
    },
    [entries, persistEntries, isCloudMode]
  )

  const deleteEntries = useCallback(
    (ids: string[]) => {
      const updated = entries.filter((e) => !ids.includes(e.id))
      persistEntries(updated)
      if (isCloudMode) {
        ids.forEach((id) => deleteCloudEntry(id))
      }
      // Also remove comments for deleted entries
      const remainingComments = entryComments.filter((c) => !ids.includes(c.entryId))
      if (remainingComments.length !== entryComments.length) {
        setEntryComments(remainingComments)
        saveEntryComments(remainingComments)
      }
    },
    [entries, persistEntries, isCloudMode, entryComments]
  )

  const importEntries = useCallback(
    (newEntries: Entry[]) => {
      const updated = [...entries, ...newEntries]
      persistEntries(updated)
      if (isCloudMode) {
        newEntries.forEach((entry) => saveCloudEntry(entry))
      }
    },
    [entries, persistEntries, isCloudMode]
  )

  const updateBudgetCategory = useCallback(
    (category: BudgetCategory) => {
      const updated = budgetCategories.map((c) => (c.id === category.id ? category : c))
      persistBudget(updated)
      if (isCloudMode) {
        saveCloudBudget(category)
      }
    },
    [budgetCategories, persistBudget, isCloudMode]
  )

  const addBudgetCategory = useCallback(
    (category: BudgetCategory) => {
      const updated = [...budgetCategories, category]
      persistBudget(updated)
      if (isCloudMode) {
        saveCloudBudget(category)
      }
    },
    [budgetCategories, persistBudget, isCloudMode]
  )

  const deleteBudgetCategoryCallback = useCallback(
    (id: string) => {
      const updated = budgetCategories.filter((c) => c.id !== id)
      persistBudget(updated)
      if (isCloudMode) {
        deleteCloudBudget(id)
      }
    },
    [budgetCategories, persistBudget, isCloudMode]
  )

  // Goals
  const addGoal = useCallback(
    (goal: Goal) => {
      const updated = [...goals, goal]
      setGoals(updated)
      saveGoals(updated)
    },
    [goals]
  )

  const updateGoal = useCallback(
    (goal: Goal) => {
      const updated = goals.map((g) => (g.id === goal.id ? goal : g))
      setGoals(updated)
      saveGoals(updated)
    },
    [goals]
  )

  const deleteGoal = useCallback(
    (id: string) => {
      const updated = goals.filter((g) => g.id !== id)
      setGoals(updated)
      saveGoals(updated)
    },
    [goals]
  )

  // Net worth items
  const addNetWorthItem = useCallback(
    (item: NetWorthItem) => {
      const updated = [...netWorthItems, item]
      setNetWorthItems(updated)
      saveNetWorthItems(updated)
    },
    [netWorthItems]
  )

  const updateNetWorthItem = useCallback(
    (item: NetWorthItem) => {
      const updated = netWorthItems.map((i) => (i.id === item.id ? item : i))
      setNetWorthItems(updated)
      saveNetWorthItems(updated)
    },
    [netWorthItems]
  )

  const deleteNetWorthItem = useCallback(
    (id: string) => {
      const updated = netWorthItems.filter((i) => i.id !== id)
      setNetWorthItems(updated)
      saveNetWorthItems(updated)
    },
    [netWorthItems]
  )

  const addNetWorthSnapshot = useCallback(
    (snapshot: NetWorthSnapshot) => {
      // Replace existing snapshot for same month if any
      const filtered = netWorthSnapshots.filter(
        (s) => s.date !== snapshot.date
      )
      const updated = [...filtered, snapshot].sort((a, b) =>
        a.date.localeCompare(b.date)
      )
      setNetWorthSnapshots(updated)
      saveNetWorthSnapshots(updated)
    },
    [netWorthSnapshots]
  )

  const deleteNetWorthSnapshot = useCallback(
    (id: string) => {
      const updated = netWorthSnapshots.filter((s) => s.id !== id)
      setNetWorthSnapshots(updated)
      saveNetWorthSnapshots(updated)
    },
    [netWorthSnapshots]
  )

  // Comments
  const addEntryComment = useCallback(
    (comment: EntryComment) => {
      const updated = [...entryComments, comment]
      setEntryComments(updated)
      saveEntryComments(updated)
    },
    [entryComments]
  )

  const deleteEntryComment = useCallback(
    (id: string) => {
      const updated = entryComments.filter((c) => c.id !== id)
      setEntryComments(updated)
      saveEntryComments(updated)
    },
    [entryComments]
  )

  const getBackupData = useCallback(
    () => ({
      entries,
      budgetCategories,
      settings: { currency, theme, members },
      goals,
      netWorthItems,
      netWorthSnapshots,
      comments: entryComments,
    }),
    [entries, budgetCategories, currency, theme, members, goals, netWorthItems, netWorthSnapshots, entryComments]
  )

  const restoreBackup = useCallback(
    (data: {
      entries: Entry[]
      budgetCategories: BudgetCategory[]
      settings: AppSettings
      goals?: Goal[]
      netWorthItems?: NetWorthItem[]
      netWorthSnapshots?: NetWorthSnapshot[]
      comments?: EntryComment[]
    }) => {
      setEntries(data.entries)
      setBudgetCategories(data.budgetCategories)
      setCurrencyState(data.settings.currency)
      setThemeState(data.settings.theme)
      setMembersState(data.settings.members)
      applyTheme(data.settings.theme)

      if (data.goals) {
        setGoals(data.goals)
        saveGoals(data.goals)
      }
      if (data.netWorthItems) {
        setNetWorthItems(data.netWorthItems)
        saveNetWorthItems(data.netWorthItems)
      }
      if (data.netWorthSnapshots) {
        setNetWorthSnapshots(data.netWorthSnapshots)
        saveNetWorthSnapshots(data.netWorthSnapshots)
      }
      if (data.comments) {
        setEntryComments(data.comments)
        saveEntryComments(data.comments)
      }

      if (isCloudMode) {
        saveAllCloudEntries(data.entries)
        saveAllCloudBudgets(data.budgetCategories)
        saveCloudSettings(data.settings)
      } else {
        saveEntries(data.entries)
        saveBudgetCategories(data.budgetCategories)
        saveSettings(data.settings)
      }
    },
    [applyTheme, isCloudMode]
  )

  const migrateLocalDataToCloud = useCallback(async (): Promise<boolean> => {
    if (!isCloudMode) return false

    const localEntries = loadEntries()
    const localBudgets = loadBudgetCategories()
    const localSettings = loadSettings()

    const [entriesOk, budgetsOk, settingsOk] = await Promise.all([
      localEntries.length > 0 ? saveAllCloudEntries(localEntries) : true,
      localBudgets.length > 0 ? saveAllCloudBudgets(localBudgets) : true,
      saveCloudSettings(localSettings),
    ])

    if (entriesOk && budgetsOk && settingsOk) {
      setEntries(localEntries)
      setBudgetCategories(localBudgets)
      setCurrencyState(localSettings.currency)
      setThemeState(localSettings.theme)
      setMembersState(localSettings.members)
      return true
    }
    return false
  }, [isCloudMode])

  return (
    <DataContext.Provider
      value={{
        entries,
        filteredEntries,
        budgetCategories,
        currency,
        setCurrency,
        theme,
        setTheme,
        members,
        setMembers,
        personFilter,
        setPersonFilter,
        saveAllSettings: saveAllSettingsCallback,
        formatAmount,
        addEntry,
        updateEntry,
        deleteEntries,
        importEntries,
        updateBudgetCategory,
        addBudgetCategory,
        deleteBudgetCategory: deleteBudgetCategoryCallback,
        getBackupData,
        restoreBackup,
        isLoaded,
        isCloudMode,
        migrateLocalDataToCloud,
        goals,
        addGoal,
        updateGoal,
        deleteGoal,
        netWorthItems,
        addNetWorthItem,
        updateNetWorthItem,
        deleteNetWorthItem,
        netWorthSnapshots,
        addNetWorthSnapshot,
        deleteNetWorthSnapshot,
        entryComments,
        addEntryComment,
        deleteEntryComment,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
