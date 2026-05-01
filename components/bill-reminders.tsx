"use client"

import { useMemo, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, X } from "lucide-react"
import { getUpcomingEntries } from "@/lib/finance"
import { useData } from "@/components/data-provider"
import { parseISO, differenceInDays, format } from "date-fns"

const DISMISS_KEY_PREFIX = "tallyr-reminder-dismissed-"

/**
 * Shows recurring bills due in the next 7 days.
 * Individual bills can be dismissed and the dismissal is remembered for 30 days.
 */
export function BillReminders() {
  const { filteredEntries, formatAmount } = useData()
  const [, forceUpdate] = useState(0)

  const upcoming = useMemo(() => {
    const bills = getUpcomingEntries(filteredEntries, 7).filter(
      (e) => e.type === "expense"
    )

    // Filter out dismissed bills (dismissed within the last 30 days)
    return bills.filter((bill) => {
      if (typeof window === "undefined") return true
      const dismissedAt = localStorage.getItem(
        `${DISMISS_KEY_PREFIX}${bill.id}-${bill.date}`
      )
      if (!dismissedAt) return true
      const daysAgo = differenceInDays(new Date(), new Date(dismissedAt))
      return daysAgo > 30
    })
  }, [filteredEntries])

  const dismiss = (id: string, date: string) => {
    localStorage.setItem(
      `${DISMISS_KEY_PREFIX}${id}-${date}`,
      new Date().toISOString()
    )
    forceUpdate((n) => n + 1)
  }

  if (upcoming.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base font-medium">
            Bills due this week
          </CardTitle>
        </div>
        <CardDescription>
          {upcoming.length} {upcoming.length === 1 ? "bill" : "bills"} coming up in the next 7 days
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 pb-4">
        {upcoming.map((bill) => {
          const daysUntil = differenceInDays(parseISO(bill.date), new Date())
          const label =
            daysUntil <= 0
              ? "Today"
              : daysUntil === 1
              ? "Tomorrow"
              : `In ${daysUntil} days`
          return (
            <div
              key={`${bill.id}-${bill.date}`}
              className="flex items-center justify-between gap-3 rounded-md border p-3"
            >
              <div className="flex min-w-0 flex-col">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{bill.merchant}</span>
                  <Badge variant="secondary" className="text-xs">
                    {label}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(parseISO(bill.date), "MMM d")} · {bill.category}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{formatAmount(bill.amount)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => dismiss(bill.id, bill.date)}
                  aria-label="Dismiss reminder"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
