"use client"

import type { Goal } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  getGoalProgress,
  getMonthlyPaceNeeded,
  getProjectedCompletion,
  estimateDebtPayoff,
} from "@/lib/goals"
import { useData } from "@/components/data-provider"
import { Plus, Pencil, Trash2, Calendar, Target, TrendingDown, PiggyBank } from "lucide-react"
import { format, parseISO } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

interface GoalCardProps {
  goal: Goal
  onAddContribution: () => void
  onEdit: () => void
  onDelete: () => void
}

const GOAL_ICONS = {
  savings: PiggyBank,
  debt: TrendingDown,
  sinking: Target,
}

const GOAL_LABELS = {
  savings: "Savings Goal",
  debt: "Debt Payoff",
  sinking: "Sinking Fund",
}

export function GoalCard({ goal, onAddContribution, onEdit, onDelete }: GoalCardProps) {
  const { formatAmount } = useData()
  const progress = getGoalProgress(goal)
  const paceNeeded = getMonthlyPaceNeeded(goal)
  const projected = getProjectedCompletion(goal)
  const Icon = GOAL_ICONS[goal.kind]

  const remaining =
    goal.kind === "debt"
      ? goal.currentAmount
      : Math.max(0, goal.targetAmount - goal.currentAmount)

  const isComplete = progress >= 100

  // For debt, calculate payoff estimate if we have interest rate and recent payment info
  const debtEstimate =
    goal.kind === "debt" && goal.minimumPayment
      ? estimateDebtPayoff(goal.currentAmount, goal.minimumPayment, goal.interestRate || 0)
      : null

  return (
    <Card className="overflow-hidden">
      <div
        className="h-1"
        style={{ backgroundColor: goal.color }}
      />
      <CardContent className="flex flex-col gap-4 pt-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${goal.color}20`, color: goal.color }}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{goal.name}</p>
              <p className="text-xs text-muted-foreground">{GOAL_LABELS[goal.kind]}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            {goal.kind === "debt" ? (
              <>
                <span className="text-2xl font-semibold tabular-nums">
                  {formatAmount(goal.currentAmount)}
                </span>
                <span className="text-xs text-muted-foreground">
                  of {formatAmount(goal.targetAmount)} owed
                </span>
              </>
            ) : (
              <>
                <span className="text-2xl font-semibold tabular-nums">
                  {formatAmount(goal.currentAmount)}
                </span>
                <span className="text-xs text-muted-foreground">
                  of {formatAmount(goal.targetAmount)}
                </span>
              </>
            )}
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {progress.toFixed(0)}% {goal.kind === "debt" ? "paid off" : "complete"}
            </span>
            <span className="font-medium">
              {isComplete
                ? goal.kind === "debt"
                  ? "Paid off!"
                  : "Goal reached!"
                : `${formatAmount(remaining)} to go`}
            </span>
          </div>
        </div>

        {(goal.deadline || paceNeeded || projected || debtEstimate) && (
          <div className="flex flex-col gap-1.5 rounded-lg bg-muted/50 p-3 text-xs">
            {goal.deadline && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Target date
                </span>
                <span className="font-medium">
                  {format(parseISO(goal.deadline), "MMM d, yyyy")}
                </span>
              </div>
            )}
            {paceNeeded !== null && !isComplete && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Pace needed</span>
                <span className="font-medium">{formatAmount(paceNeeded)}/mo</span>
              </div>
            )}
            {goal.kind === "sinking" && goal.monthlyContribution && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Monthly target</span>
                <span className="font-medium">
                  {formatAmount(goal.monthlyContribution)}/mo
                </span>
              </div>
            )}
            {debtEstimate && debtEstimate.months !== null && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Payoff in</span>
                  <span className="font-medium">
                    {debtEstimate.months} {debtEstimate.months === 1 ? "month" : "months"}
                  </span>
                </div>
                {debtEstimate.totalInterest > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total interest</span>
                    <span className="font-medium">
                      {formatAmount(debtEstimate.totalInterest)}
                    </span>
                  </div>
                )}
              </>
            )}
            {projected && !isComplete && !goal.deadline && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">At current pace</span>
                <span className="font-medium">{format(projected, "MMM yyyy")}</span>
              </div>
            )}
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={onAddContribution}
          disabled={isComplete && goal.kind !== "sinking"}
        >
          <Plus className="h-3.5 w-3.5" />
          {goal.kind === "debt" ? "Log Payment" : "Add Contribution"}
        </Button>
      </CardContent>
    </Card>
  )
}
