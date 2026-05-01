"use client"

import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useData } from "@/components/data-provider"
import { ALL_CATEGORIES } from "@/lib/constants"
import { toast } from "sonner"
import type { Entry } from "@/lib/types"
import { Trash2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { EntryCommentsSection } from "@/components/entry-comments"

interface EditEntrySheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: Entry | null
}

export function EditEntrySheet({ open, onOpenChange, entry }: EditEntrySheetProps) {
  const { updateEntry, deleteEntries, members } = useData()

  const [merchant, setMerchant] = useState("")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState("")
  const [type, setType] = useState<"income" | "expense">("expense")
  const [recurrence, setRecurrence] = useState<"none" | "monthly" | "yearly">("none")
  const [category, setCategory] = useState(ALL_CATEGORIES[0])
  const [notes, setNotes] = useState("")
  const [assignedTo, setAssignedTo] = useState("shared")
  const [paidBy, setPaidBy] = useState<string>("none")

  useEffect(() => {
    if (entry) {
      setMerchant(entry.merchant)
      setAmount(entry.amount.toString())
      setDate(entry.date)
      setType(entry.type)
      setRecurrence(entry.recurrence)
      setCategory(entry.category)
      setNotes(entry.notes || "")
      setAssignedTo(entry.assignedTo ?? "shared")
      setPaidBy(entry.paidBy ?? "none")
    }
  }, [entry])

  const handleSave = () => {
    if (!entry) return
    const parsedAmount = parseFloat(amount)
    if (!merchant.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please fill in merchant and a valid amount")
      return
    }

    updateEntry({
      ...entry,
      merchant: merchant.trim(),
      amount: parsedAmount,
      date,
      type,
      recurrence,
      category,
      notes: notes.trim() || undefined,
      assignedTo,
      paidBy: paidBy === "none" ? undefined : paidBy,
    })
    toast.success("Entry updated")
    onOpenChange(false)
  }

  const handleDelete = () => {
    if (!entry) return
    deleteEntries([entry.id])
    toast.success("Entry deleted")
    onOpenChange(false)
  }

  if (!entry) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-6 overflow-y-auto px-4 pb-4">
        <SheetHeader>
          <SheetTitle>Edit Entry</SheetTitle>
          <SheetDescription>Modify the details of this transaction.</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-merchant">Merchant</Label>
            <Input
              id="edit-merchant"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-amount">Amount</Label>
            <Input
              id="edit-amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-date">Date</Label>
            <Input
              id="edit-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as "income" | "expense")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Recurrence</Label>
            <Select
              value={recurrence}
              onValueChange={(v) => setRecurrence(v as "none" | "monthly" | "yearly")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">One-time</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Assigned To</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
                <SelectItem value="shared">Shared (split equally)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {assignedTo === "shared" && type === "expense" && (
            <div className="flex flex-col gap-2">
              <Label>Paid By</Label>
              <Select value={paidBy} onValueChange={setPaidBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Who paid?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not tracked</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Used for settlement tracking in the Splits view
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <Separator className="my-2" />

          <EntryCommentsSection entry={entry} />
        </div>

        <div className="mt-auto flex items-center justify-between pt-4">
          <Button variant="ghost" size="sm" className="text-destructive gap-2" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
