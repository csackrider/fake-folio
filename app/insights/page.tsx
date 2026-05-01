"use client"

import { useState, useRef, useMemo, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useData } from "@/components/data-provider"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getRecurringMonthlyTotal,
  getSubscriptions,
  getSpentByCategory,
  getDateRange,
  getSavingsRateTrend,
  getMonthOverMonthComparison,
  getCategoryTrends,
  detectAnomalies,
  getBudgetRollovers,
} from "@/lib/finance"
import { exportInsightsPDF } from "@/lib/pdf-export"
import { parseISO, format, startOfMonth, endOfMonth, eachMonthOfInterval, isWithinInterval } from "date-fns"
import { FileDown, TrendingUp, TrendingDown, AlertTriangle, PiggyBank, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart,
} from "recharts"

const CHART_COLORS = [
  "oklch(0.646 0.222 41.116)",
  "oklch(0.6 0.118 184.704)",
  "oklch(0.398 0.07 227.392)",
  "oklch(0.828 0.189 84.429)",
  "oklch(0.769 0.188 70.08)",
  "oklch(0.55 0.15 150)",
  "oklch(0.7 0.15 300)",
  "oklch(0.65 0.2 60)",
]

type TimeRange = "month" | "3months" | "year"

export default function InsightsPage() {
  return (
    <Suspense fallback={<InsightsSkeleton />}>
      <InsightsContent />
    </Suspense>
  )
}

function InsightsContent() {
  const { filteredEntries: entries, budgetCategories, isLoaded, formatAmount } = useData()
  const [range, setRange] = useState<TimeRange>("3months")
  const chartsRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()
  const [autoExported, setAutoExported] = useState(false)

  const dateRange = useMemo(() => getDateRange(range), [range])

  const filteredExpenses = useMemo(
    () =>
      entries.filter(
        (e) =>
          e.type === "expense" &&
          isWithinInterval(parseISO(e.date), dateRange)
      ),
    [entries, dateRange]
  )

  const totalSpent = useMemo(
    () => filteredExpenses.reduce((sum, e) => sum + e.amount, 0),
    [filteredExpenses]
  )

  const recurringTotal = useMemo(() => getRecurringMonthlyTotal(entries), [entries])

  const categoryData = useMemo(() => {
    const spent = getSpentByCategory(entries, dateRange)
    return Object.entries(spent)
      .map(([name, amount]) => ({ name, value: amount }))
      .sort((a, b) => b.value - a.value)
  }, [entries, dateRange])

  const stackedBarData = useMemo(() => {
    const months = eachMonthOfInterval(dateRange)
    return months.map((monthDate) => {
      const monthStart = startOfMonth(monthDate)
      const monthEnd = endOfMonth(monthDate)
      const monthEntries = entries.filter(
        (e) =>
          e.type === "expense" &&
          isWithinInterval(parseISO(e.date), { start: monthStart, end: monthEnd })
      )
      const recurring = monthEntries
        .filter((e) => e.recurrence !== "none")
        .reduce((sum, e) => sum + e.amount, 0)
      const variable = monthEntries
        .filter((e) => e.recurrence === "none")
        .reduce((sum, e) => sum + e.amount, 0)

      return {
        month: format(monthDate, "MMM"),
        Recurring: recurring,
        Variable: variable,
      }
    })
  }, [entries, dateRange])

  const trendData = useMemo(() => {
    const months = eachMonthOfInterval(dateRange)
    return months.map((monthDate) => {
      const monthStart = startOfMonth(monthDate)
      const monthEnd = endOfMonth(monthDate)
      const total = entries
        .filter(
          (e) =>
            e.type === "expense" &&
            isWithinInterval(parseISO(e.date), { start: monthStart, end: monthEnd })
        )
        .reduce((sum, e) => sum + e.amount, 0)

      return {
        month: format(monthDate, "MMM"),
        Spending: total,
      }
    })
  }, [entries, dateRange])

  const topSubscriptions = useMemo(() => {
    return getSubscriptions(entries)
      .filter((e) => e.type === "expense")
      .sort((a, b) => {
        const aMonthly = a.recurrence === "yearly" ? a.amount / 12 : a.amount
        const bMonthly = b.recurrence === "yearly" ? b.amount / 12 : b.amount
        return bMonthly - aMonthly
      })
      .slice(0, 5)
  }, [entries])

  const savingsTrend = useMemo(() => getSavingsRateTrend(entries, 6), [entries])
  const currentSavings = savingsTrend[savingsTrend.length - 1]
  const savingsChartData = useMemo(
    () =>
      savingsTrend.map((s) => ({
        month: format(s.monthDate, "MMM"),
        "Savings Rate": Math.round(s.rate),
        Income: s.income,
        Spent: s.expense,
      })),
    [savingsTrend]
  )

  const momComparison = useMemo(() => getMonthOverMonthComparison(entries), [entries])
  const categoryTrends = useMemo(() => getCategoryTrends(entries).slice(0, 5), [entries])
  const anomalies = useMemo(() => detectAnomalies(entries, 3), [entries])
  const rollovers = useMemo(
    () => getBudgetRollovers(entries, budgetCategories, 1).filter((r) => r.unused > 0),
    [entries, budgetCategories]
  )

  const handleExportPDF = async () => {
    if (!chartsRef.current) return
    toast.info("Generating PDF...")
    try {
      await exportInsightsPDF(chartsRef.current, {
        dateRange: `${format(dateRange.start, "MMM d, yyyy")} - ${format(dateRange.end, "MMM d, yyyy")}`,
        totalSpent,
        recurringTotal,
        categoryBreakdown: categoryData.map((d) => ({ name: d.name, amount: d.value })),
        topSubscriptions: topSubscriptions.map((s) => ({
          merchant: s.merchant,
          amount: s.recurrence === "yearly" ? s.amount / 12 : s.amount,
        })),
      })
      toast.success("PDF exported!")
    } catch {
      toast.error("Failed to export PDF")
    }
  }

  useEffect(() => {
    if (searchParams.get("export") === "true" && isLoaded && !autoExported) {
      setAutoExported(true)
      const timer = setTimeout(() => {
        handleExportPDF()
      }, 1000)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isLoaded, autoExported])

  if (!isLoaded) {
    return <InsightsSkeleton />
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Insights</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visualize your spending patterns and savings trends
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleExportPDF}>
          <FileDown className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      <Tabs value={range} onValueChange={(v) => setRange(v as TimeRange)}>
        <TabsList>
          <TabsTrigger value="month">This Month</TabsTrigger>
          <TabsTrigger value="3months">Last 3 Months</TabsTrigger>
          <TabsTrigger value="year">This Year</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Spent"
          value={formatAmount(totalSpent)}
          sublabel={`${format(dateRange.start, "MMM d")} - ${format(dateRange.end, "MMM d")}`}
        />
        <StatCard
          label="Monthly Recurring"
          value={formatAmount(recurringTotal)}
          sublabel="Normalized monthly"
        />
        <StatCard
          label="Savings Rate"
          value={currentSavings ? `${Math.round(currentSavings.rate)}%` : "0%"}
          sublabel={
            currentSavings && currentSavings.income > 0
              ? `${formatAmount(currentSavings.saved)} saved this month`
              : "Add income to see this"
          }
          variant={
            currentSavings && currentSavings.rate >= 20
              ? "positive"
              : currentSavings && currentSavings.rate < 0
              ? "negative"
              : "default"
          }
        />
      </div>

      {anomalies.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Unusual Spending This Month
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col gap-2">
              {anomalies.slice(0, 5).map((a) => (
                <div
                  key={a.entry.id}
                  className="flex items-center justify-between rounded-lg bg-background px-3 py-2.5"
                >
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium">{a.entry.merchant}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.entry.category} • {format(parseISO(a.entry.date), "MMM d")}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <p className="text-sm font-semibold">{formatAmount(a.entry.amount)}</p>
                    <p className="text-xs text-amber-700 dark:text-amber-500">
                      {formatAmount(a.deviation)} above avg
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div ref={chartsRef} className="flex flex-col gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <PiggyBank className="h-4 w-4" />
              Savings Rate Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={savingsChartData}>
                <defs>
                  <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS[5]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS[5]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.922 0 0)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="oklch(0.556 0 0)" />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="oklch(0.556 0 0)"
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid oklch(0.922 0 0)",
                    fontSize: "13px",
                  }}
                  formatter={(value: number) => [`${value}%`, "Savings Rate"]}
                />
                <Area
                  type="monotone"
                  dataKey="Savings Rate"
                  stroke={CHART_COLORS[5]}
                  strokeWidth={2}
                  fill="url(#savingsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                {momComparison.change >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-destructive" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-emerald-600" />
                )}
                Month over Month
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex items-baseline gap-3">
                <p className="text-3xl font-semibold">{formatAmount(momComparison.current)}</p>
                {momComparison.previous > 0 && (
                  <span
                    className={`text-sm font-medium ${
                      momComparison.change >= 0
                        ? "text-destructive"
                        : "text-emerald-600 dark:text-emerald-500"
                    }`}
                  >
                    {momComparison.change >= 0 ? "+" : ""}
                    {momComparison.changePercent.toFixed(1)}%
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                vs {formatAmount(momComparison.previous)} last month
              </p>

              {categoryTrends.length > 0 && (
                <div className="mt-4 flex flex-col gap-1.5 border-t pt-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Biggest Changes
                  </p>
                  {categoryTrends.map((c) => (
                    <div
                      key={c.category}
                      className="flex items-center justify-between py-1 text-sm"
                    >
                      <span className="text-foreground">{c.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">
                          {formatAmount(c.previous)}
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{formatAmount(c.current)}</span>
                        {c.previous > 0 && (
                          <span
                            className={`text-xs w-12 text-right ${
                              c.change >= 0
                                ? "text-destructive"
                                : "text-emerald-600 dark:text-emerald-500"
                            }`}
                          >
                            {c.change >= 0 ? "+" : ""}
                            {c.changePercent.toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Budget Rollover</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              {rollovers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No unused budget last month.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Set up budget categories to track rollover.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-muted-foreground mb-2">
                    Unused budget from last month you can carry forward
                  </p>
                  {rollovers.slice(0, 5).map((r) => (
                    <div
                      key={r.category.id}
                      className="flex items-center justify-between py-1.5"
                    >
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-medium">{r.category.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Spent {formatAmount(r.spent)} of {formatAmount(r.category.allocated)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-500">
                        +{formatAmount(r.unused)}
                      </span>
                    </div>
                  ))}
                  <div className="mt-2 flex items-center justify-between border-t pt-3">
                    <p className="text-sm font-medium">Total Rollover</p>
                    <p className="text-sm font-semibold">
                      {formatAmount(rollovers.reduce((sum, r) => sum + r.unused, 0))}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Recurring vs Variable Spending</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stackedBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.922 0 0)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="oklch(0.556 0 0)" />
                <YAxis tick={{ fontSize: 12 }} stroke="oklch(0.556 0 0)" />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid oklch(0.922 0 0)",
                    fontSize: "13px",
                  }}
                  formatter={(value: number) => formatAmount(value)}
                />
                <Legend />
                <Bar dataKey="Recurring" stackId="a" fill={CHART_COLORS[0]} radius={[0, 0, 0, 0]} />
                <Bar dataKey="Variable" stackId="a" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start">
              <ResponsiveContainer width="100%" height={280} className="max-w-xs">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid oklch(0.922 0 0)",
                      fontSize: "13px",
                    }}
                    formatter={(value: number) => formatAmount(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3">
                {categoryData.map((cat, i) => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {cat.name} ({formatAmount(cat.value)})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Spending Trend</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.922 0 0)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="oklch(0.556 0 0)" />
                <YAxis tick={{ fontSize: 12 }} stroke="oklch(0.556 0 0)" />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid oklch(0.922 0 0)",
                    fontSize: "13px",
                  }}
                  formatter={(value: number) => formatAmount(value)}
                />
                <Line
                  type="monotone"
                  dataKey="Spending"
                  stroke={CHART_COLORS[0]}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS[0], r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Most Expensive Recurring</CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-4">
          {topSubscriptions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No recurring charges found.
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {topSubscriptions.map((sub, i) => {
                const monthlyAmount =
                  sub.recurrence === "yearly" ? sub.amount / 12 : sub.amount
                return (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between rounded-lg px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                        {i + 1}
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-medium">{sub.merchant}</p>
                        <p className="text-xs text-muted-foreground">{sub.category}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium">
                      {formatAmount(monthlyAmount)}/mo
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function InsightsSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-56" />
      </div>
      <Skeleton className="h-10 w-80" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-80 rounded-xl" />
      ))}
    </div>
  )
}
