"use client"

import { useState, useEffect } from "react"
import type { Goal, GoalContribution } from "@/lib/types"
import { useData } from "@/components/data-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { format } from "date-fns"

interface ContributionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  goal: Goal | null
}

export function ContributionDialog({ open, onOpenChange, goal }: ContributionDialogProps) {
  const { updateGoal, formatAmount } = useData()
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [note, setNote] = useState("")

  useEffect(() => {
    if (open) {
      setAmount("")
      setDate(format(new Date(), "yyyy-MM-dd"))
      setNote("")
    }
  }, [open])

  if (!goal) return null

  const isDebt = goal.kind === "debt"

  const handleSave = () => {
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    const contribution: GoalContribution = {
      id: `contrib-${Date.now()}`,
      amount: amountNum,
      date: new Date(date).toISOString(),
      note: note.trim() || undefined,
    }

    // For debt: reduce currentAmount (remaining balance)
    // For savings/sinking: increase currentAmount (saved amount)
    const newCurrent = isDebt
      ? Math.max(0, goal.currentAmount - amountNum)
      : goal.currentAmount + amountNum

    const updated: Goal = {
      ...goal,
      currentAmount: newCurrent,
      contributions: [...goal.contributions, contribution],
    }

    updateGoal(updated)
    toast.success(
      isDebt
        ? `Payment of ${formatAmount(amountNum)} logged`
        : `${formatAmount(amountNum)} added to ${goal.name}`
    )
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {isDebt ? "Log Payment" : "Add Contribution"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-2">
          <p className="text-sm text-muted-foreground">
            {isDebt ? "Paying toward " : "Contributing to "}
            <span className="font-medium text-foreground">{goal.name}</span>
          </p>

          <div className="flex flex-col gap-2">
            <Label htmlFor="contrib-amount">Amount</Label>
            <Input
              id="contrib-amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="contrib-date">Date</Label>
            <Input
              id="contrib-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="contrib-note">Note (optional)</Label>
            <Input
              id="contrib-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Tax refund"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {isDebt ? "Log Payment" : "Add"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
