"use client"

import { useState, useMemo, useCallback } from "react"
import { useData } from "@/components/data-provider"
import { CsvImportDialog } from "@/components/csv-import-dialog"
import { EditEntrySheet } from "@/components/edit-entry-sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ALL_CATEGORIES } from "@/lib/constants"
import { format, parseISO } from "date-fns"
import { FileUp, Search, MoreHorizontal, Repeat, Trash2, Tag } from "lucide-react"
import { toast } from "sonner"
import type { Entry } from "@/lib/types"
import { PersonBadge } from "@/components/person-badge"

export default function ActivityPage() {
  const { entries, filteredEntries, isLoaded, updateEntry, deleteEntries, formatAmount } = useData()
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [csvOpen, setCsvOpen] = useState(false)
  const [editEntry, setEditEntry] = useState<Entry | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [reassignCategory, setReassignCategory] = useState<string | null>(null)

  const sorted = useMemo(() => {
    const filtered = filteredEntries.filter((e) => {
      const q = search.toLowerCase()
      return (
        e.merchant.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.notes?.toLowerCase().includes(q)
      )
    })
    return filtered.sort(
      (a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()
    )
  }, [filteredEntries, search])

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleAll = useCallback(() => {
    if (selected.size === sorted.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(sorted.map((e) => e.id)))
    }
  }, [selected.size, sorted])

  const handleBulkDelete = () => {
    deleteEntries(Array.from(selected))
    toast.success(`Deleted ${selected.size} entries`)
    setSelected(new Set())
  }

  const handleBulkConvertRecurring = () => {
    const ids = Array.from(selected)
    ids.forEach((id) => {
      const entry = entries.find((e) => e.id === id)
      if (entry && entry.recurrence === "none") {
        updateEntry({ ...entry, recurrence: "monthly" })
      }
    })
    toast.success(`Converted ${ids.length} entries to recurring`)
    setSelected(new Set())
  }

  const handleBulkReassign = (category: string) => {
    const ids = Array.from(selected)
    ids.forEach((id) => {
      const entry = entries.find((e) => e.id === id)
      if (entry) {
        updateEntry({ ...entry, category })
      }
    })
    toast.success(`Reassigned ${ids.length} entries to ${category}`)
    setSelected(new Set())
    setReassignCategory(null)
  }

  if (!isLoaded) {
    return <ActivitySkeleton />
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Activity</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All transactions, newest first
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => setCsvOpen(true)}>
          <FileUp className="h-4 w-4" />
          Import CSV
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by merchant, category, or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3">
          <span className="text-sm font-medium">
            {selected.size} selected
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleBulkConvertRecurring}
            >
              <Repeat className="h-3.5 w-3.5" />
              Make Recurring
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Tag className="h-3.5 w-3.5" />
                  Reassign
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-64 overflow-y-auto">
                {ALL_CATEGORIES.map((cat) => (
                  <DropdownMenuItem
                    key={cat}
                    onClick={() => handleBulkReassign(cat)}
                  >
                    {cat}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-destructive"
              onClick={handleBulkDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col">
        {sorted.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 border-b border-border">
            <Checkbox
              checked={selected.size === sorted.length && sorted.length > 0}
              onCheckedChange={toggleAll}
              aria-label="Select all"
            />
            <span className="text-xs text-muted-foreground">
              {sorted.length} entries
            </span>
          </div>
        )}

        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-muted-foreground">
              {search
                ? "No entries match your search."
                : "No entries yet. Add your first entry from the Dashboard."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {sorted.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-muted/50"
              >
                <Checkbox
                  checked={selected.has(entry.id)}
                  onCheckedChange={() => toggleSelect(entry.id)}
                  aria-label={`Select ${entry.merchant}`}
                />
                <button
                  className="flex flex-1 items-center justify-between text-left"
                  onClick={() => {
                    setEditEntry(entry)
                    setSheetOpen(true)
                  }}
                >
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium text-foreground">
                      {entry.merchant}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(entry.date), "MMM d, yyyy")}
                      </p>
                      <Badge variant="secondary" className="text-xs font-normal px-2 py-0">
                        {entry.category}
                      </Badge>
                      {entry.recurrence !== "none" && (
                        <Badge variant="outline" className="text-xs font-normal px-2 py-0">
                          <Repeat className="h-3 w-3 mr-1" />
                          {entry.recurrence}
                        </Badge>
                      )}
                      {entry.type === "income" && (
                        <Badge className="text-xs font-normal px-2 py-0 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                          Income
                        </Badge>
                      )}
                      <PersonBadge assignedTo={entry.assignedTo} />
                    </div>
                  </div>
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
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <CsvImportDialog open={csvOpen} onOpenChange={setCsvOpen} />
      <EditEntrySheet open={sheetOpen} onOpenChange={setSheetOpen} entry={editEntry} />
    </div>
  )
}

function ActivitySkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-56" />
      </div>
      <Skeleton className="h-10 w-full rounded-lg" />
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-lg" />
      ))}
    </div>
  )
}
