"use client"

import { useState } from "react"
import { useData } from "@/components/data-provider"
import { StatCard } from "@/components/stat-card"
import { EditEntrySheet } from "@/components/edit-entry-sheet"
import { AddEntryDialog } from "@/components/add-entry-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getSubscriptions } from "@/lib/finance"
import { format, parseISO } from "date-fns"
import { Pencil, Plus } from "lucide-react"
import type { Entry } from "@/lib/types"
import { PersonBadge } from "@/components/person-badge"

export default function SubscriptionsPage() {
  const { filteredEntries: entries, isLoaded, formatAmount } = useData()
  const [editEntry, setEditEntry] = useState<Entry | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)

  if (!isLoaded) {
    return <SubscriptionsSkeleton />
  }

  const subscriptions = getSubscriptions(entries)

  const monthlyTotal = subscriptions
    .filter((e) => e.type === "expense")
    .reduce((sum, e) => {
      if (e.recurrence === "yearly") return sum + e.amount / 12
      return sum + e.amount
    }, 0)

  const yearlyItems = subscriptions.filter(
    (e) => e.type === "expense" && e.recurrence === "yearly"
  )
  const yearlyTotal = yearlyItems.reduce((sum, e) => sum + e.amount, 0)

  const handleEdit = (entry: Entry) => {
    setEditEntry(entry)
    setSheetOpen(true)
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Recurring</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All recurring charges in one place
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Total Monthly Recurring"
          value={formatAmount(monthlyTotal)}
          sublabel={`${subscriptions.filter((e) => e.type === "expense").length} active recurring`}
        />
        <StatCard
          label="Yearly Charges"
          value={formatAmount(yearlyTotal)}
          sublabel={`${yearlyItems.length} yearly recurring (${formatAmount(yearlyTotal / 12)}/mo)`}
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Active Recurring</CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-4">
          {subscriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No recurring entries found.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Add an entry with monthly or yearly recurrence to see it here.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between rounded-lg px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium text-foreground">{sub.merchant}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        Renews {format(parseISO(sub.date), "MMM d, yyyy")}
                      </p>
                      <Badge variant="secondary" className="text-xs font-normal px-2 py-0">
                        {sub.category}
                      </Badge>
                      <PersonBadge assignedTo={sub.assignedTo} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end gap-0.5">
                      <span
                        className={
                          sub.type === "income"
                            ? "text-sm font-medium text-emerald-600"
                            : "text-sm font-medium text-foreground"
                        }
                      >
                        {formatAmount(sub.amount)}
                      </span>
                      <Badge variant="outline" className="text-xs font-normal">
                        {sub.recurrence === "monthly" ? "Monthly" : "Yearly"}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                      onClick={() => handleEdit(sub)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span className="sr-only">Edit {sub.merchant}</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <EditEntrySheet open={sheetOpen} onOpenChange={setSheetOpen} entry={editEntry} />
      <AddEntryDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}

function SubscriptionsSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}
