"use client"

import { useData } from "@/components/data-provider"
import { cn } from "@/lib/utils"

// Color palette that cycles for each member
const BADGE_COLORS = [
  { bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-700 dark:text-blue-300" },
  { bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-700 dark:text-amber-300" },
  { bg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-700 dark:text-emerald-300" },
  { bg: "bg-purple-100 dark:bg-purple-900/40", text: "text-purple-700 dark:text-purple-300" },
  { bg: "bg-rose-100 dark:bg-rose-900/40", text: "text-rose-700 dark:text-rose-300" },
  { bg: "bg-cyan-100 dark:bg-cyan-900/40", text: "text-cyan-700 dark:text-cyan-300" },
]

interface PersonBadgeProps {
  assignedTo?: string
  className?: string
}

export function PersonBadge({ assignedTo, className }: PersonBadgeProps) {
  const { members } = useData()
  const assigned = assignedTo ?? "shared"

  if (assigned === "shared") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full bg-muted px-2 py-0 text-xs font-medium text-muted-foreground",
          className
        )}
      >
        Shared
      </span>
    )
  }

  // Find the member by ID
  const memberIndex = members.findIndex((m) => m.id === assigned)
  const member = members[memberIndex]
  
  if (!member) {
    // Unknown member ID, show as shared
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full bg-muted px-2 py-0 text-xs font-medium text-muted-foreground",
          className
        )}
      >
        {assigned}
      </span>
    )
  }

  // Get color based on member index, cycling through the palette
  const colorIndex = memberIndex % BADGE_COLORS.length
  const colors = BADGE_COLORS[colorIndex]

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0 text-xs font-medium",
        colors.bg,
        colors.text,
        className
      )}
    >
      {member.name}
    </span>
  )
}
