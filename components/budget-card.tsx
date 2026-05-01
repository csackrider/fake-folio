"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useData } from "@/components/data-provider"
import { CURRENCIES } from "@/lib/constants"
import type { BudgetCategory } from "@/lib/types"
import { Pencil, Check, Trash2 } from "lucide-react"

interface BudgetCardProps {
  category: BudgetCategory
  spent: number
}

export function BudgetCard({ category, spent }: BudgetCardProps) {
  const { updateBudgetCategory, deleteBudgetCategory, formatAmount, currency } = useData()
  const [isEditing, setIsEditing] = useState(false)
  const [editAmount, setEditAmount] = useState(category.allocated.toString())

  const remaining = category.allocated - spent
  const percent = category.allocated > 0 ? Math.min((spent / category.allocated) * 100, 100) : 0
  const isOverBudget = spent > category.allocated

  const currencySymbol = CURRENCIES.find((c) => c.code === currency)?.symbol ?? "$"

  const handleSaveAllocation = () => {
    const val = parseFloat(editAmount)
    if (!isNaN(val) && val >= 0) {
      updateBudgetCategory({ ...category, allocated: val })
    }
    setIsEditing(false)
  }

  const handleToggleEssential = () => {
    updateBudgetCategory({ ...category, isEssential: !category.isEssential })
  }

  return (
    <Card className="relative">
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-medium text-foreground">{category.name}</h3>
            {category.isEssential && (
              <Badge variant="secondary" className="text-xs font-normal w-fit">
                Essential
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              onClick={() => deleteBudgetCategory(category.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="sr-only">Delete {category.name}</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{currencySymbol}</span>
              <Input
                type="number"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                className="h-8 w-24"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveAllocation()
                  if (e.key === "Escape") setIsEditing(false)
                }}
                autoFocus
              />
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSaveAllocation}>
                <Check className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <button
              onClick={() => {
                setEditAmount(category.allocated.toString())
                setIsEditing(true)
              }}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {formatAmount(category.allocated)} budgeted
              <Pencil className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Progress value={percent} className="h-2" />
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {formatAmount(spent)} spent
            </span>
            <span
              className={
                isOverBudget
                  ? "font-medium text-destructive"
                  : "text-muted-foreground"
              }
            >
              {isOverBudget
                ? `${formatAmount(Math.abs(remaining))} over`
                : `${formatAmount(remaining)} left`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-border">
          <Switch
            id={`essential-${category.id}`}
            checked={category.isEssential}
            onCheckedChange={handleToggleEssential}
            className="scale-75"
          />
          <Label
            htmlFor={`essential-${category.id}`}
            className="text-xs text-muted-foreground cursor-pointer"
          >
            Essential
          </Label>
        </div>
      </CardContent>
    </Card>
  )
}
