"use client"

import type { Entry } from "@/lib/types"
import { useData } from "@/components/data-provider"
import { format, parseISO } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { PersonBadge } from "@/components/person-badge"

interface UpcomingListProps {
  entries: Entry[]
}

export function UpcomingList({ entries }: UpcomingListProps) {
  const { formatAmount } = useData()
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-muted-foreground">
          No upcoming entries in the next 30 days.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Add a recurring entry to see it here.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="flex items-center justify-between rounded-lg px-4 py-3 transition-colors hover:bg-muted/50"
        >
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-medium text-foreground">{entry.merchant}</p>
            <p className="text-xs text-muted-foreground">
              {format(parseISO(entry.date), "MMM d, yyyy")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <PersonBadge assignedTo={entry.assignedTo} />
            {entry.recurrence !== "none" && (
              <Badge variant="secondary" className="text-xs font-normal">
                {entry.recurrence === "monthly" ? "Monthly" : "Yearly"}
              </Badge>
            )}
            <span
              className={
                entry.type === "income"
                  ? "text-sm font-medium text-emerald-600"
                  : "text-sm font-medium text-foreground"
              }
            >
              {entry.type === "income" ? "+" : "-"}
              {formatAmount(entry.amount)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
