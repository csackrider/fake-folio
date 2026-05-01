"use client"

import { useState } from "react"
import { useData } from "@/components/data-provider"
import { StatCard } from "@/components/stat-card"
import { UpcomingList } from "@/components/upcoming-list"
import { AddEntryDialog } from "@/components/add-entry-dialog"
import { CsvImportDialog } from "@/components/csv-import-dialog"
import { BillReminders } from "@/components/bill-reminders"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getMonthlyIncome,
  getRecurringMonthlyTotal,
  getUpcomingEntries,
} from "@/lib/finance"
import { Plus, Upload } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export default function HomePage() {
  const { filteredEntries, isLoaded, formatAmount } = useData()
  const [addOpen, setAddOpen] = useState(false)
  const [csvOpen, setCsvOpen] = useState(false)

  if (!isLoaded) {
    return <DashboardSkeleton />
  }

  const monthlyIncome = getMonthlyIncome(filteredEntries)
  const recurringTotal = getRecurringMonthlyTotal(filteredEntries)
  const remaining = monthlyIncome - recurringTotal
  const commitPercent = monthlyIncome > 0 ? (recurringTotal / monthlyIncome) * 100 : 0
  const upcoming = getUpcomingEntries(filteredEntries, 30)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Your financial overview at a glance</p>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" onClick={() => setCsvOpen(true)}>
                <Upload className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Import CSV</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => setAddOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Entry
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <span className="text-xs">
                Press <kbd className="rounded border bg-muted px-1">⌘N</kbd> anywhere
              </span>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Monthly Income"
          value={formatAmount(monthlyIncome)}
          sublabel="This month"
          variant="positive"
        />
        <StatCard
          label="Monthly Recurring"
          value={formatAmount(recurringTotal)}
          sublabel="Recurring & bills"
        />
        <StatCard
          label="After Recurring"
          value={formatAmount(remaining)}
          sublabel="Remaining this month"
          variant={remaining >= 0 ? "positive" : "negative"}
        />
        <StatCard
          label="% Committed"
          value={`${commitPercent.toFixed(1)}%`}
          sublabel="Of income to recurring"
          variant={commitPercent > 80 ? "negative" : "default"}
        />
      </div>

      <BillReminders />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Upcoming (Next 30 Days)</CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-4">
          <UpcomingList entries={upcoming} />
        </CardContent>
      </Card>

      <AddEntryDialog open={addOpen} onOpenChange={setAddOpen} />
      <CsvImportDialog open={csvOpen} onOpenChange={setCsvOpen} />
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-60" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}
