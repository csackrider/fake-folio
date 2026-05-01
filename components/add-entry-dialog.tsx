"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { format } from "date-fns"

interface AddEntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editEntry?: Entry | null
}

export function AddEntryDialog({ open, onOpenChange, editEntry }: AddEntryDialogProps) {
  const { addEntry, updateEntry, members } = useData()
  const isEditing = !!editEntry

  const [merchant, setMerchant] = useState(editEntry?.merchant || "")
  const [amount, setAmount] = useState(editEntry?.amount.toString() || "")
  const [date, setDate] = useState(editEntry?.date || format(new Date(), "yyyy-MM-dd"))
  const [type, setType] = useState<"income" | "expense">(editEntry?.type || "expense")
  const [recurrence, setRecurrence] = useState<"none" | "monthly" | "yearly">(
    editEntry?.recurrence || "none"
  )
  const [category, setCategory] = useState(editEntry?.category || ALL_CATEGORIES[0])
  const [notes, setNotes] = useState(editEntry?.notes || "")
  const [assignedTo, setAssignedTo] = useState(editEntry?.assignedTo || "shared")
  const [paidBy, setPaidBy] = useState<string>(editEntry?.paidBy || "none")

  const resetForm = () => {
    setMerchant("")
    setAmount("")
    setDate(format(new Date(), "yyyy-MM-dd"))
    setType("expense")
    setRecurrence("none")
    setCategory(ALL_CATEGORIES[0])
    setNotes("")
    setAssignedTo("shared")
    setPaidBy("none")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const parsedAmount = parseFloat(amount)
    if (!merchant.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please fill in merchant and a valid amount")
      return
    }

    const entry: Entry = {
      id: editEntry?.id || `entry-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      merchant: merchant.trim(),
      amount: parsedAmount,
      date,
      type,
      recurrence,
      category,
      notes: notes.trim() || undefined,
      assignedTo,
      paidBy: paidBy === "none" ? undefined : paidBy,
    }

    if (isEditing) {
      updateEntry(entry)
      toast.success("Entry updated")
    } else {
      addEntry(entry)
      toast.success("Entry added")
    }

    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) resetForm()
        onOpenChange(val)
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Entry" : "Add Entry"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Modify the details of this transaction." : "Add a new income or expense entry."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="merchant">Merchant</Label>
            <Input
              id="merchant"
              placeholder="e.g. Netflix, Whole Foods"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-1 flex-col gap-2">
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
            <div className="flex flex-1 flex-col gap-2">
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
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? "Save Changes" : "Add Entry"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
