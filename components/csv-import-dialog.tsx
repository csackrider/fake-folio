"use client"

import { useCallback, useRef } from "react"
import Papa from "papaparse"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useData } from "@/components/data-provider"
import { toast } from "sonner"
import type { Entry } from "@/lib/types"
import { FileUp } from "lucide-react"

interface CsvImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CsvImportDialog({ open, onOpenChange }: CsvImportDialogProps) {
  const { importEntries } = useData()
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete(results) {
          const imported: Entry[] = []
          for (const row of results.data as Record<string, string>[]) {
            const amount = parseFloat(row.amount || row.Amount || "0")
            if (isNaN(amount) || amount === 0) continue

            imported.push({
              id: `import-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
              amount: Math.abs(amount),
              date: row.date || row.Date || new Date().toISOString().split("T")[0],
              type: amount < 0 || (row.type || row.Type || "").toLowerCase() === "expense"
                ? "expense"
                : "income",
              recurrence: "none",
              category: row.category || row.Category || "Miscellaneous",
              merchant: row.merchant || row.Merchant || row.description || row.Description || "Unknown",
              notes: row.notes || row.Notes || undefined,
              assignedTo: row.assignedTo || "shared",
            })
          }

          if (imported.length > 0) {
            importEntries(imported)
            toast.success(`Imported ${imported.length} entries`)
            onOpenChange(false)
          } else {
            toast.error("No valid entries found in CSV")
          }
        },
        error() {
          toast.error("Failed to parse CSV file")
        },
      })

      // Reset file input
      if (fileRef.current) fileRef.current.value = ""
    },
    [importEntries, onOpenChange]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with columns: date, merchant, amount, type, category.
            Headers are auto-detected.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-6">
          <div className="flex h-32 w-full items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50">
            <label className="flex cursor-pointer flex-col items-center gap-2 text-muted-foreground">
              <FileUp className="h-8 w-8" />
              <span className="text-sm font-medium">Choose a CSV file</span>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="sr-only"
                onChange={handleFile}
              />
            </label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
