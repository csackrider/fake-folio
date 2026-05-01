"use client"

import { useState, useMemo } from "react"
import { useData } from "@/components/data-provider"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { StatCard } from "@/components/stat-card"
import { GoalCard } from "@/components/goal-card"
import { GoalDialog, GoalKindPicker } from "@/components/goal-dialog"
import { ContributionDialog } from "@/components/contribution-dialog"
import type { Goal, GoalKind } from "@/lib/types"
import { Plus, Target, PiggyBank, TrendingDown } from "lucide-react"
import { toast } from "sonner"

type FilterTab = "all" | GoalKind

export default function GoalsPage() {
  const { goals, deleteGoal, isLoaded, formatAmount } = useData()
  const [filter, setFilter] = useState<FilterTab>("all")
  const [pickerOpen, setPickerOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogKind, setDialogKind] = useState<GoalKind>("savings")
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [contribGoal, setContribGoal] = useState<Goal | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Goal | null>(null)

  const { savingsGoals, debtGoals, sinkingFunds } = useMemo(() => {
    return {
      savingsGoals: goals.filter((g) => g.kind === "savings"),
      debtGoals: goals.filter((g) => g.kind === "debt"),
      sinkingFunds: goals.filter((g) => g.kind === "sinking"),
    }
  }, [goals])

  const visibleGoals = useMemo(() => {
    if (filter === "all") return goals
    return goals.filter((g) => g.kind === filter)
  }, [goals, filter])

  const totalSaved = useMemo(
    () =>
      [...savingsGoals, ...sinkingFunds].reduce(
        (sum, g) => sum + g.currentAmount,
        0
      ),
    [savingsGoals, sinkingFunds]
  )

  const totalDebt = useMemo(
    () => debtGoals.reduce((sum, g) => sum + g.currentAmount, 0),
    [debtGoals]
  )

  const activeGoalCount = goals.length

  const handleCreateGoal = (kind: GoalKind) => {
    setPickerOpen(false)
    setDialogKind(kind)
    setEditingGoal(null)
    setDialogOpen(true)
  }

  const handleEdit = (goal: Goal) => {
    setDialogKind(goal.kind)
    setEditingGoal(goal)
    setDialogOpen(true)
  }

  const handleDelete = () => {
    if (!deleteConfirm) return
    deleteGoal(deleteConfirm.id)
    toast.success(`Deleted ${deleteConfirm.name}`)
    setDeleteConfirm(null)
  }

  if (!isLoaded) {
    return <GoalsSkeleton />
  }

  const emptyState =
    filter === "all" && goals.length === 0 ? (
      <EmptyState onCreate={() => setPickerOpen(true)} />
    ) : null

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Goals</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track savings, pay down debt, and plan for what&apos;s next
          </p>
        </div>
        <Button onClick={() => setPickerOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Goal
        </Button>
      </div>

      {goals.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Saved"
            value={formatAmount(totalSaved)}
            sublabel={`Across ${savingsGoals.length + sinkingFunds.length} goals`}
            variant="positive"
          />
          <StatCard
            label="Total Debt"
            value={formatAmount(totalDebt)}
            sublabel={`Across ${debtGoals.length} ${debtGoals.length === 1 ? "account" : "accounts"}`}
            variant={totalDebt > 0 ? "negative" : "default"}
          />
          <StatCard
            label="Active Goals"
            value={activeGoalCount.toString()}
            sublabel="Total across all types"
          />
        </div>
      )}

      {emptyState}

      {goals.length > 0 && (
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterTab)}>
          <TabsList>
            <TabsTrigger value="all">All ({goals.length})</TabsTrigger>
            <TabsTrigger value="savings" className="gap-1.5">
              <PiggyBank className="h-3.5 w-3.5" />
              Savings ({savingsGoals.length})
            </TabsTrigger>
            <TabsTrigger value="debt" className="gap-1.5">
              <TrendingDown className="h-3.5 w-3.5" />
              Debt ({debtGoals.length})
            </TabsTrigger>
            <TabsTrigger value="sinking" className="gap-1.5">
              <Target className="h-3.5 w-3.5" />
              Sinking ({sinkingFunds.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-6">
            {visibleGoals.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  No {filter === "all" ? "" : filter + " "}goals yet
                </p>
                <Button variant="outline" onClick={() => setPickerOpen(true)}>
                  Create your first goal
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onAddContribution={() => setContribGoal(goal)}
                    onEdit={() => handleEdit(goal)}
                    onDelete={() => setDeleteConfirm(goal)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      <GoalKindPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onPick={handleCreateGoal}
      />
      <GoalDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        kind={dialogKind}
        existing={editingGoal}
      />
      <ContributionDialog
        open={!!contribGoal}
        onOpenChange={(open) => !open && setContribGoal(null)}
        goal={contribGoal}
      />
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this goal?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove &quot;{deleteConfirm?.name}&quot; and all its
              contribution history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
        <Target className="h-5 w-5 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-medium mb-1">No goals yet</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        Set savings targets, track debt payoff, or create sinking funds for
        upcoming expenses.
      </p>
      <Button onClick={onCreate} className="gap-2">
        <Plus className="h-4 w-4" />
        Create your first goal
      </Button>
    </div>
  )
}

function GoalsSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
