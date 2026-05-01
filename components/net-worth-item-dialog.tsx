"use client"

import { useState, useEffect } from "react"
import type {
  NetWorthItem,
  AssetLiabilityKind,
  AssetCategory,
  LiabilityCategory,
} from "@/lib/types"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

export const ASSET_CATEGORIES: { value: AssetCategory; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "checking", label: "Checking Account" },
  { value: "savings", label: "Savings Account" },
  { value: "investment", label: "Investment Account" },
  { value: "retirement", label: "Retirement (401k/IRA)" },
  { value: "real-estate", label: "Real Estate" },
  { value: "vehicle", label: "Vehicle" },
  { value: "other-asset", label: "Other Asset" },
]

export const LIABILITY_CATEGORIES: { value: LiabilityCategory; label: string }[] = [
  { value: "credit-card", label: "Credit Card" },
  { value: "mortgage", label: "Mortgage" },
  { value: "auto-loan", label: "Auto Loan" },
  { value: "student-loan", label: "Student Loan" },
  { value: "personal-loan", label: "Personal Loan" },
  { value: "other-debt", label: "Other Debt" },
]

interface NetWorthItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  kind: AssetLiabilityKind
  existing?: NetWorthItem | null
}

export function NetWorthItemDialog({
  open,
  onOpenChange,
  kind,
  existing,
}: NetWorthItemDialogProps) {
  const { addNetWorthItem, updateNetWorthItem } = useData()
  const [name, setName] = useState("")
  const [category, setCategory] = useState<string>(
    kind === "asset" ? "cash" : "credit-card"
  )
  const [balance, setBalance] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (open) {
      if (existing) {
        setName(existing.name)
        setCategory(existing.category)
        setBalance(existing.balance.toString())
        setNotes(existing.notes ?? "")
      } else {
        setName("")
        setCategory(kind === "asset" ? "cash" : "credit-card")
        setBalance("")
        setNotes("")
      }
    }
  }, [open, existing, kind])

  const categories = kind === "asset" ? ASSET_CATEGORIES : LIABILITY_CATEGORIES

  const handleSave = () => {
    const balanceNum = parseFloat(balance)
    if (!name.trim()) {
      toast.error("Please enter a name")
      return
    }
    if (isNaN(balanceNum) || balanceNum < 0) {
      toast.error("Please enter a valid balance")
      return
    }

    const now = new Date().toISOString()
    const item: NetWorthItem = {
      id: existing?.id || `nw-${Date.now()}`,
      kind,
      category: category as AssetCategory | LiabilityCategory,
      name: name.trim(),
      balance: balanceNum,
      notes: notes.trim() || undefined,
      updatedAt: now,
      createdAt: existing?.createdAt || now,
    }

    if (existing) {
      updateNetWorthItem(item)
      toast.success("Updated")
    } else {
      addNetWorthItem(item)
      toast.success("Added")
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {existing ? "Edit" : "Add"} {kind === "asset" ? "Asset" : "Liability"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="nw-name">Name</Label>
            <Input
              id="nw-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                kind === "asset" ? "e.g. Chase Checking" : "e.g. Visa Card"
              }
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="nw-category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="nw-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="nw-balance">
              {kind === "asset" ? "Current Value" : "Balance Owed"}
            </Label>
            <Input
              id="nw-balance"
              type="number"
              min="0"
              step="0.01"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="nw-notes">Notes (optional)</Label>
            <Textarea
              id="nw-notes"
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
              {existing ? "Save Changes" : "Add"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
