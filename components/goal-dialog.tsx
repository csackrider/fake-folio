"use client"

import { useState, useEffect } from "react"
import type { Goal, GoalKind } from "@/lib/types"
import { useData } from "@/components/data-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface GoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  kind: GoalKind
  existing?: Goal | null
}

const GOAL_COLORS = [
  "oklch(0.55 0.15 150)", // green
  "oklch(0.6 0.118 184.704)", // teal
  "oklch(0.398 0.07 227.392)", // blue
  "oklch(0.828 0.189 84.429)", // yellow
  "oklch(0.646 0.222 41.116)", // orange
  "oklch(0.65 0.2 350)", // pink
  "oklch(0.7 0.15 280)", // purple
]

const TITLES = {
  savings: "Savings Goal",
  debt: "Debt Payoff",
  sinking: "Sinking Fund",
}

export function GoalDialog({ open, onOpenChange, kind, existing }: GoalDialogProps) {
  const { addGoal, updateGoal } = useData()
  const [name, setName] = useState("")
  const [targetAmount, setTargetAmount] = useState("")
  const [currentAmount, setCurrentAmount] = useState("")
  const [deadline, setDeadline] = useState("")
  const [monthlyContribution, setMonthlyContribution] = useState("")
  const [interestRate, setInterestRate] = useState("")
  const [minimumPayment, setMinimumPayment] = useState("")
  const [notes, setNotes] = useState("")
  const [color, setColor] = useState(GOAL_COLORS[0])

  useEffect(() => {
    if (open) {
      if (existing) {
        setName(existing.name)
        setTargetAmount(existing.targetAmount.toString())
        setCurrentAmount(existing.currentAmount.toString())
        setDeadline(existing.deadline ?? "")
        setMonthlyContribution(existing.monthlyContribution?.toString() ?? "")
        setInterestRate(existing.interestRate?.toString() ?? "")
        setMinimumPayment(existing.minimumPayment?.toString() ?? "")
        setNotes(existing.notes ?? "")
        setColor(existing.color)
      } else {
        setName("")
        setTargetAmount("")
        setCurrentAmount("")
        setDeadline("")
        setMonthlyContribution("")
        setInterestRate("")
        setMinimumPayment("")
        setNotes("")
        setColor(GOAL_COLORS[Math.floor(Math.random() * GOAL_COLORS.length)])
      }
    }
  }, [open, existing])

  const handleSave = () => {
    const target = parseFloat(targetAmount)
    const current = parseFloat(currentAmount) || 0

    if (!name.trim()) {
      toast.error("Please enter a name")
      return
    }
    if (isNaN(target) || target <= 0) {
      toast.error("Please enter a valid target amount")
      return
    }

    const goalData: Goal = {
      id: existing?.id || `goal-${Date.now()}`,
      kind,
      name: name.trim(),
      targetAmount: target,
      currentAmount: current,
      deadline: deadline || undefined,
      monthlyContribution: monthlyContribution
        ? parseFloat(monthlyContribution)
        : undefined,
      interestRate: interestRate ? parseFloat(interestRate) : undefined,
      minimumPayment: minimumPayment ? parseFloat(minimumPayment) : undefined,
      notes: notes.trim() || undefined,
      color,
      createdAt: existing?.createdAt || new Date().toISOString(),
      contributions: existing?.contributions || [],
    }

    if (existing) {
      updateGoal(goalData)
      toast.success("Goal updated")
    } else {
      addGoal(goalData)
      toast.success("Goal created")
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existing ? "Edit" : "New"} {TITLES[kind]}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="goal-name">Name</Label>
            <Input
              id="goal-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                kind === "savings"
                  ? "e.g. Emergency Fund"
                  : kind === "debt"
                  ? "e.g. Credit Card"
                  : "e.g. Car Maintenance"
              }
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="goal-target">
                {kind === "debt" ? "Initial Balance" : "Target"}
              </Label>
              <Input
                id="goal-target"
                type="number"
                min="0"
                step="10"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="goal-current">
                {kind === "debt" ? "Current Balance" : "Current Saved"}
              </Label>
              <Input
                id="goal-current"
                type="number"
                min="0"
                step="10"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          {(kind === "savings" || kind === "sinking") && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="goal-deadline">Target Date (optional)</Label>
              <Input
                id="goal-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          )}

          {kind === "sinking" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="goal-monthly">Monthly Contribution (optional)</Label>
              <Input
                id="goal-monthly"
                type="number"
                min="0"
                step="10"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(e.target.value)}
                placeholder="0"
              />
            </div>
          )}

          {kind === "debt" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="goal-apr">APR % (optional)</Label>
                <Input
                  id="goal-apr"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="goal-min-payment">Monthly Payment</Label>
                <Input
                  id="goal-min-payment"
                  type="number"
                  min="0"
                  step="10"
                  value={minimumPayment}
                  onChange={(e) => setMinimumPayment(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {GOAL_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full border-2 transition-transform ${
                    color === c ? "border-foreground scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="goal-notes">Notes (optional)</Label>
            <Textarea
              id="goal-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {existing ? "Save Changes" : "Create Goal"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Kind picker for creating a new goal - shown before the detail dialog.
 */
export function GoalKindPicker({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPick: (kind: GoalKind) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>What kind of goal?</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 pt-2">
          <KindOption
            title="Savings Goal"
            description="Save toward something specific like a trip, house, or emergency fund"
            onClick={() => onPick("savings")}
          />
          <KindOption
            title="Debt Payoff"
            description="Track your progress paying down a loan or credit card"
            onClick={() => onPick("debt")}
          />
          <KindOption
            title="Sinking Fund"
            description="Set aside money monthly for irregular expenses like car repairs or gifts"
            onClick={() => onPick("sinking")}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function KindOption({
  title,
  description,
  onClick,
}: {
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col gap-1 rounded-lg border border-border p-4 text-left transition-colors hover:bg-muted"
    >
      <span className="font-medium">{title}</span>
      <span className="text-xs text-muted-foreground">{description}</span>
    </button>
  )
}

