"use client"

import { useState } from "react"
import { useData } from "@/components/data-provider"
import { BudgetCard } from "@/components/budget-card"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  getSpentByCategory,
  getLeftAfterEssentials,
  getMonthlyIncome,
} from "@/lib/finance"
import { CATEGORY_COLORS } from "@/lib/constants"
import type { BudgetCategory } from "@/lib/types"
import { Plus } from "lucide-react"
import { toast } from "sonner"

export default function BudgetPage() {
  const { filteredEntries, budgetCategories, addBudgetCategory, isLoaded, formatAmount } = useData()
  const [addOpen, setAddOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newAmount, setNewAmount] = useState("")
  const [newEssential, setNewEssential] = useState(false)

  if (!isLoaded) {
    return <BudgetSkeleton />
  }

  const spentByCategory = getSpentByCategory(filteredEntries)
  const leftAfterEssentials = getLeftAfterEssentials(filteredEntries, budgetCategories)
  const monthlyIncome = getMonthlyIncome(filteredEntries)
  const totalAllocated = budgetCategories.reduce((sum, c) => sum + c.allocated, 0)
  const totalSpent = Object.values(spentByCategory).reduce((sum, v) => sum + v, 0)

  const handleAddCategory = () => {
    const amount = parseFloat(newAmount)
    if (!newName.trim() || isNaN(amount) || amount < 0) {
      toast.error("Please provide a valid name and amount")
      return
    }

    const category: BudgetCategory = {
      id: `cat-${Date.now()}`,
      name: newName.trim(),
      allocated: amount,
      isEssential: newEssential,
      color: CATEGORY_COLORS[newName.trim()] || "var(--chart-3)",
    }

    addBudgetCategory(category)
    toast.success(`Added ${newName.trim()} category`)
    setNewName("")
    setNewAmount("")
    setNewEssential(false)
    setAddOpen(false)
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Budget</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track spending against your budget targets
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Left After Essentials"
          value={formatAmount(leftAfterEssentials)}
          sublabel="Income minus essential spend"
          variant={leftAfterEssentials >= 0 ? "positive" : "negative"}
        />
        <StatCard
          label="Total Allocated"
          value={formatAmount(totalAllocated)}
          sublabel={`${budgetCategories.length} categories`}
        />
        <StatCard
          label="Total Spent"
          value={formatAmount(totalSpent)}
          sublabel={
            totalAllocated > 0
              ? `${((totalSpent / totalAllocated) * 100).toFixed(0)}% of budget`
              : "This month"
          }
          variant={totalSpent > totalAllocated ? "negative" : "default"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {budgetCategories.map((cat) => (
          <BudgetCard
            key={cat.id}
            category={cat}
            spent={spentByCategory[cat.name] || 0}
          />
        ))}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Budget Category</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="cat-name">Category Name</Label>
              <Input
                id="cat-name"
                placeholder="e.g. Clothing"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cat-amount">Monthly Budget</Label>
              <Input
                id="cat-amount"
                type="number"
                min="0"
                step="10"
                placeholder="0"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="cat-essential"
                checked={newEssential}
                onCheckedChange={setNewEssential}
              />
              <Label htmlFor="cat-essential" className="cursor-pointer">
                Essential category
              </Label>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCategory}>Add Category</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function BudgetSkeleton() {
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
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
