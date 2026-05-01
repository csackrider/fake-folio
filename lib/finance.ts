import type { Entry, BudgetCategory } from "./types"
import {
  isWithinInterval,
  startOfMonth,
  endOfMonth,
  addDays,
  parseISO,
  startOfYear,
  endOfYear,
  subMonths,
} from "date-fns"

import type { CurrencyCode } from "./types"
import { CURRENCIES } from "./constants"

export function formatCurrency(amount: number, currencyCode: CurrencyCode = "USD"): string {
  const info = CURRENCIES.find((c) => c.code === currencyCode)
  const locale = info?.locale ?? "en-US"
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function getMonthlyIncome(entries: Entry[]): number {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  return entries
    .filter(
      (e) =>
        e.type === "income" &&
        isWithinInterval(parseISO(e.date), { start: monthStart, end: monthEnd })
    )
    .reduce((sum, e) => sum + e.amount, 0)
}

export function getRecurringMonthlyTotal(entries: Entry[]): number {
  return entries
    .filter((e) => e.type === "expense" && e.recurrence !== "none")
    .reduce((sum, e) => {
      if (e.recurrence === "yearly") return sum + e.amount / 12
      return sum + e.amount
    }, 0)
}

export function getUpcomingEntries(entries: Entry[], days: number = 30): Entry[] {
  const now = new Date()
  const futureDate = addDays(now, days)

  return entries
    .filter((e) => {
      const d = parseISO(e.date)
      return d >= now && d <= futureDate
    })
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
}

export function getSubscriptions(entries: Entry[]): Entry[] {
  return entries.filter((e) => e.recurrence !== "none")
}

export function getSpentByCategory(
  entries: Entry[],
  dateRange?: { start: Date; end: Date }
): Record<string, number> {
  const now = new Date()
  const range = dateRange || { start: startOfMonth(now), end: endOfMonth(now) }

  const result: Record<string, number> = {}
  entries
    .filter(
      (e) =>
        e.type === "expense" &&
        isWithinInterval(parseISO(e.date), range)
    )
    .forEach((e) => {
      result[e.category] = (result[e.category] || 0) + e.amount
    })
  return result
}

export function getLeftAfterEssentials(
  entries: Entry[],
  budgetCategories: BudgetCategory[]
): number {
  const monthlyIncome = getMonthlyIncome(entries)
  const essentialCategories = budgetCategories
    .filter((c) => c.isEssential)
    .map((c) => c.name)

  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const essentialSpend = entries
    .filter(
      (e) =>
        e.type === "expense" &&
        essentialCategories.includes(e.category) &&
        isWithinInterval(parseISO(e.date), { start: monthStart, end: monthEnd })
    )
    .reduce((sum, e) => sum + e.amount, 0)

  // Also include recurring essential costs not yet billed this month
  const recurringEssentialTotal = entries
    .filter(
      (e) =>
        e.type === "expense" &&
        e.recurrence !== "none" &&
        essentialCategories.includes(e.category)
    )
    .reduce((sum, e) => {
      if (e.recurrence === "yearly") return sum + e.amount / 12
      return sum + e.amount
    }, 0)

  return monthlyIncome - Math.max(essentialSpend, recurringEssentialTotal)
}

export function getDateRange(range: "month" | "3months" | "year"): { start: Date; end: Date } {
  const now = new Date()
  switch (range) {
    case "month":
      return { start: startOfMonth(now), end: endOfMonth(now) }
    case "3months":
      return { start: startOfMonth(subMonths(now, 2)), end: endOfMonth(now) }
    case "year":
      return { start: startOfYear(now), end: endOfYear(now) }
  }
}

/**
 * 1b: Calculate savings rate for a given month.
 * Returns percentage (0-100) representing (income - expense) / income.
 */
export function getSavingsRateForMonth(entries: Entry[], monthDate: Date): {
  income: number
  expense: number
  saved: number
  rate: number
} {
  const monthStart = startOfMonth(monthDate)
  const monthEnd = endOfMonth(monthDate)

  const monthEntries = entries.filter((e) =>
    isWithinInterval(parseISO(e.date), { start: monthStart, end: monthEnd })
  )

  const income = monthEntries
    .filter((e) => e.type === "income")
    .reduce((sum, e) => sum + e.amount, 0)

  const expense = monthEntries
    .filter((e) => e.type === "expense")
    .reduce((sum, e) => sum + e.amount, 0)

  const saved = income - expense
  const rate = income > 0 ? (saved / income) * 100 : 0

  return { income, expense, saved, rate }
}

/**
 * 1b: Savings rate over multiple months (for trend chart).
 */
export function getSavingsRateTrend(entries: Entry[], months: number = 6): Array<{
  monthDate: Date
  income: number
  expense: number
  saved: number
  rate: number
}> {
  const now = new Date()
  const result = []
  for (let i = months - 1; i >= 0; i--) {
    const monthDate = subMonths(now, i)
    const data = getSavingsRateForMonth(entries, monthDate)
    result.push({ monthDate, ...data })
  }
  return result
}

/**
 * 1a: Month-over-month spending comparison.
 * Returns current month spend vs previous month spend with % change.
 */
export function getMonthOverMonthComparison(entries: Entry[]): {
  current: number
  previous: number
  change: number
  changePercent: number
} {
  const now = new Date()
  const currentMonth = { start: startOfMonth(now), end: endOfMonth(now) }
  const prevDate = subMonths(now, 1)
  const previousMonth = { start: startOfMonth(prevDate), end: endOfMonth(prevDate) }

  const current = entries
    .filter((e) => e.type === "expense" && isWithinInterval(parseISO(e.date), currentMonth))
    .reduce((sum, e) => sum + e.amount, 0)

  const previous = entries
    .filter((e) => e.type === "expense" && isWithinInterval(parseISO(e.date), previousMonth))
    .reduce((sum, e) => sum + e.amount, 0)

  const change = current - previous
  const changePercent = previous > 0 ? (change / previous) * 100 : 0

  return { current, previous, change, changePercent }
}

/**
 * 1a: Category-level month-over-month comparison.
 * Returns categories with the biggest % changes.
 */
export function getCategoryTrends(entries: Entry[]): Array<{
  category: string
  current: number
  previous: number
  change: number
  changePercent: number
}> {
  const now = new Date()
  const currentMonth = { start: startOfMonth(now), end: endOfMonth(now) }
  const prevDate = subMonths(now, 1)
  const previousMonth = { start: startOfMonth(prevDate), end: endOfMonth(prevDate) }

  const currentSpend = getSpentByCategory(entries, currentMonth)
  const previousSpend = getSpentByCategory(entries, previousMonth)

  const allCategories = new Set([
    ...Object.keys(currentSpend),
    ...Object.keys(previousSpend),
  ])

  return Array.from(allCategories)
    .map((category) => {
      const current = currentSpend[category] || 0
      const previous = previousSpend[category] || 0
      const change = current - previous
      const changePercent = previous > 0 ? (change / previous) * 100 : current > 0 ? 100 : 0
      return { category, current, previous, change, changePercent }
    })
    .filter((c) => c.current > 0 || c.previous > 0)
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
}

/**
 * 1c: Anomaly detection. Identifies entries that are unusually large
 * compared to the category's recent average.
 */
export function detectAnomalies(entries: Entry[], lookbackMonths: number = 3): Array<{
  entry: Entry
  categoryAverage: number
  deviation: number
}> {
  const now = new Date()
  const lookbackStart = startOfMonth(subMonths(now, lookbackMonths))
  const currentMonthStart = startOfMonth(now)

  // Get current month entries
  const currentEntries = entries.filter(
    (e) =>
      e.type === "expense" &&
      parseISO(e.date) >= currentMonthStart &&
      e.recurrence === "none"
  )

  // Build category averages from historical data (excluding current month)
  const categoryEntries: Record<string, number[]> = {}
  entries
    .filter((e) => {
      const d = parseISO(e.date)
      return (
        e.type === "expense" &&
        e.recurrence === "none" &&
        d >= lookbackStart &&
        d < currentMonthStart
      )
    })
    .forEach((e) => {
      if (!categoryEntries[e.category]) categoryEntries[e.category] = []
      categoryEntries[e.category].push(e.amount)
    })

  const anomalies: Array<{ entry: Entry; categoryAverage: number; deviation: number }> = []

  currentEntries.forEach((entry) => {
    const amounts = categoryEntries[entry.category] || []
    if (amounts.length < 3) return // not enough data for a meaningful average

    const avg = amounts.reduce((sum, a) => sum + a, 0) / amounts.length
    // Flag as anomaly if 2x the average and at least $50 absolute
    if (entry.amount >= avg * 2 && entry.amount - avg >= 50) {
      anomalies.push({
        entry,
        categoryAverage: avg,
        deviation: entry.amount - avg,
      })
    }
  })

  return anomalies.sort((a, b) => b.deviation - a.deviation)
}

/**
 * 1e: Budget rollover - how much of each budget category was unused last month.
 */
export function getBudgetRollovers(
  entries: Entry[],
  budgetCategories: BudgetCategory[],
  monthsBack: number = 1
): Array<{ category: BudgetCategory; unused: number; spent: number }> {
  const now = new Date()
  const monthDate = subMonths(now, monthsBack)
  const monthRange = { start: startOfMonth(monthDate), end: endOfMonth(monthDate) }
  const spent = getSpentByCategory(entries, monthRange)

  return budgetCategories.map((cat) => {
    const spentAmount = spent[cat.name] || 0
    const unused = Math.max(0, cat.allocated - spentAmount)
    return { category: cat, unused, spent: spentAmount }
  })
}

/**
 * 1b: Current month income - used for dashboard.
 */
export function getCurrentMonthExpense(entries: Entry[]): number {
  const now = new Date()
  return entries
    .filter(
      (e) =>
        e.type === "expense" &&
        isWithinInterval(parseISO(e.date), {
          start: startOfMonth(now),
          end: endOfMonth(now),
        })
    )
    .reduce((sum, e) => sum + e.amount, 0)
}
