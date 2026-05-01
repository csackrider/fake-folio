"use client"

import { useMemo, useState } from "react"
import { useData } from "@/components/data-provider"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  startOfMonth,
  endOfMonth,
  format,
  subMonths,
  parseISO,
  isWithinInterval,
} from "date-fns"
import {
  getSavingsRateForMonth,
  getSpentByCategory,
  getMonthOverMonthComparison,
  getCategoryTrends,
} from "@/lib/finance"
import { TrendingDown, TrendingUp, Trophy, PiggyBank, Award } from "lucide-react"

export default function MonthReviewPage() {
  const { filteredEntries, formatAmount, budgetCategories, isLoaded } = useData()

  // Build options for the last 12 months
  const monthOptions = useMemo(() => {
    const now = new Date()
    return Array.from({ length: 12 }).map((_, i) => {
      const d = subMonths(now, i)
      return {
        value: format(d, "yyyy-MM"),
        label: format(d, "MMMM yyyy"),
        date: d,
      }
    })
  }, [])

  const [selected, setSelected] = useState(monthOptions[0].value)

  const monthDate = useMemo(() => {
    const opt = monthOptions.find((o) => o.value === selected)
    return opt?.date || new Date()
  }, [selected, monthOptions])

  const monthRange = useMemo(
    () => ({ start: startOfMonth(monthDate), end: endOfMonth(monthDate) }),
    [monthDate]
  )

  const monthEntries = useMemo(
    () =>
      filteredEntries.filter((e) =>
        isWithinInterval(parseISO(e.date), monthRange)
      ),
    [filteredEntries, monthRange]
  )

  const savings = useMemo(
    () => getSavingsRateForMonth(filteredEntries, monthDate),
    [filteredEntries, monthDate]
  )

  const previousMonthSavings = useMemo(
    () => getSavingsRateForMonth(filteredEntries, subMonths(monthDate, 1)),
    [filteredEntries, monthDate]
  )

  const spentByCategory = useMemo(
    () => getSpentByCategory(filteredEntries, monthRange),
    [filteredEntries, monthRange]
  )

  const topCategories = useMemo(() => {
    return Object.entries(spentByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  }, [spentByCategory])

  const biggestExpenses = useMemo(() => {
    return monthEntries
      .filter((e) => e.type === "expense")
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
  }, [monthEntries])

  const mom = useMemo(
    () => getMonthOverMonthComparison(filteredEntries),
    [filteredEntries]
  )

  const categoryTrends = useMemo(() => {
    const trends = getCategoryTrends(filteredEntries)
    return {
      increases: trends.filter((c) => c.changePercent > 0).slice(0, 3),
      decreases: trends.filter((c) => c.changePercent < 0).slice(0, 3),
    }
  }, [filteredEntries])

  const budgetResults = useMemo(() => {
    return budgetCategories.map((cat) => {
      const spent = spentByCategory[cat.name] || 0
      return {
        category: cat,
        spent,
        remaining: cat.allocated - spent,
        percentUsed: cat.allocated > 0 ? (spent / cat.allocated) * 100 : 0,
      }
    })
  }, [budgetCategories, spentByCategory])

  const underBudget = budgetResults.filter(
    (r) => r.remaining > 0 && r.category.allocated > 0
  )
  const overBudget = budgetResults.filter((r) => r.remaining < 0)

  const savingsRateChange = savings.rate - previousMonthSavings.rate

  if (!isLoaded) return null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Month Review</h1>
          <p className="text-sm text-muted-foreground">
            A look back at your month in numbers.
          </p>
        </div>
        <div className="w-48">
          <Label htmlFor="month" className="sr-only">
            Month
          </Label>
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger id="month">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {monthEntries.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="font-medium">No data for {format(monthDate, "MMMM yyyy")}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Once you add entries for this month, your review will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Hero summary */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Income</CardDescription>
                <CardTitle className="text-2xl">{formatAmount(savings.income)}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Expenses</CardDescription>
                <CardTitle className="text-2xl">{formatAmount(savings.expense)}</CardTitle>
              </CardHeader>
              <CardContent>
                {mom.previous > 0 && (
                  <p
                    className={`text-xs ${
                      mom.changePercent < 0 ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {mom.changePercent > 0 ? "+" : ""}
                    {mom.changePercent.toFixed(1)}% vs last month
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Saved</CardDescription>
                <CardTitle
                  className={`text-2xl ${
                    savings.saved >= 0 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {formatAmount(savings.saved)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {savings.rate.toFixed(1)}% savings rate
                  </Badge>
                  {Math.abs(savingsRateChange) > 0.1 && (
                    <span
                      className={`text-xs ${
                        savingsRateChange > 0 ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {savingsRateChange > 0 ? "+" : ""}
                      {savingsRateChange.toFixed(1)}pt
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Top Spending Categories
              </CardTitle>
              <CardDescription>Where your money went this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {topCategories.map(([category, amount], idx) => (
                  <div
                    key={category}
                    className="flex items-center justify-between gap-3 rounded-md border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                        {idx + 1}
                      </div>
                      <span className="font-medium">{category}</span>
                    </div>
                    <span className="font-semibold">{formatAmount(amount)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Biggest single expenses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Biggest Expenses</CardTitle>
              <CardDescription>Largest single transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {biggestExpenses.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between gap-3 rounded-md border p-3"
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-medium">{e.merchant}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(parseISO(e.date), "MMM d")} · {e.category}
                      </span>
                    </div>
                    <span className="font-semibold">{formatAmount(e.amount)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trends vs last month */}
          {(categoryTrends.increases.length > 0 || categoryTrends.decreases.length > 0) && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {categoryTrends.increases.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-red-600" />
                      Spent More On
                    </CardTitle>
                    <CardDescription>Compared to last month</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    {categoryTrends.increases.map((c) => (
                      <div
                        key={c.category}
                        className="flex items-center justify-between gap-3 rounded-md border p-3"
                      >
                        <span className="font-medium">{c.category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {formatAmount(c.current)}
                          </span>
                          <Badge variant="destructive">
                            +{c.changePercent.toFixed(0)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
              {categoryTrends.decreases.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-emerald-600" />
                      Spent Less On
                    </CardTitle>
                    <CardDescription>Compared to last month</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    {categoryTrends.decreases.map((c) => (
                      <div
                        key={c.category}
                        className="flex items-center justify-between gap-3 rounded-md border p-3"
                      >
                        <span className="font-medium">{c.category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {formatAmount(c.current)}
                          </span>
                          <Badge className="bg-emerald-600 hover:bg-emerald-700">
                            {c.changePercent.toFixed(0)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Budget wins / misses */}
          {budgetResults.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Award className="h-4 w-4 text-emerald-600" />
                    Budget Wins
                  </CardTitle>
                  <CardDescription>
                    Categories where you stayed under budget
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {underBudget.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No categories under budget this month.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {underBudget.map((r) => (
                        <div
                          key={r.category.id}
                          className="flex items-center justify-between gap-3 rounded-md border p-3"
                        >
                          <span className="font-medium">{r.category.name}</span>
                          <span className="text-sm text-emerald-600">
                            {formatAmount(r.remaining)} left
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {overBudget.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Over Budget</CardTitle>
                    <CardDescription>
                      Categories that went over their limit
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      {overBudget.map((r) => (
                        <div
                          key={r.category.id}
                          className="flex items-center justify-between gap-3 rounded-md border p-3"
                        >
                          <span className="font-medium">{r.category.name}</span>
                          <span className="text-sm text-red-600">
                            {formatAmount(Math.abs(r.remaining))} over
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Final note */}
          <Card>
            <CardContent className="flex items-start gap-3 p-4">
              <PiggyBank className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground text-pretty">
                {savings.rate >= 20
                  ? `Great month. You saved ${savings.rate.toFixed(
                      0
                    )}% of your income — above the recommended 20% target.`
                  : savings.rate >= 10
                  ? `Solid month. You saved ${savings.rate.toFixed(
                      0
                    )}% of your income. Consider aiming for 20% if you can.`
                  : savings.rate >= 0
                  ? `You saved ${savings.rate.toFixed(
                      0
                    )}% this month. Look at your top categories above for places to trim next month.`
                  : `You spent more than you earned this month. Review your biggest expenses and see if any recurring charges can be trimmed.`}
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
