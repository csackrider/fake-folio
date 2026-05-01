"use client"

import { useState, useMemo } from "react"
import { useData } from "@/components/data-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import {
  NetWorthItemDialog,
  ASSET_CATEGORIES,
  LIABILITY_CATEGORIES,
} from "@/components/net-worth-item-dialog"
import type { NetWorthItem, NetWorthSnapshot, AssetLiabilityKind } from "@/lib/types"
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  Camera,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import { format, parseISO, startOfMonth } from "date-fns"
import { toast } from "sonner"

export default function NetWorthPage() {
  const {
    netWorthItems,
    netWorthSnapshots,
    deleteNetWorthItem,
    addNetWorthSnapshot,
    deleteNetWorthSnapshot,
    isLoaded,
    formatAmount,
  } = useData()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogKind, setDialogKind] = useState<AssetLiabilityKind>("asset")
  const [editingItem, setEditingItem] = useState<NetWorthItem | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<NetWorthItem | null>(null)

  const { assets, liabilities, totalAssets, totalLiabilities, netWorth } =
    useMemo(() => {
      const assets = netWorthItems.filter((i) => i.kind === "asset")
      const liabilities = netWorthItems.filter((i) => i.kind === "liability")
      const totalAssets = assets.reduce((sum, i) => sum + i.balance, 0)
      const totalLiabilities = liabilities.reduce((sum, i) => sum + i.balance, 0)
      return {
        assets,
        liabilities,
        totalAssets,
        totalLiabilities,
        netWorth: totalAssets - totalLiabilities,
      }
    }, [netWorthItems])

  const chartData = useMemo(() => {
    const sorted = [...netWorthSnapshots].sort((a, b) =>
      a.date.localeCompare(b.date)
    )
    return sorted.map((s) => ({
      date: format(parseISO(s.date), "MMM yyyy"),
      rawDate: s.date,
      id: s.id,
      "Net Worth": s.netWorth,
      Assets: s.totalAssets,
      Liabilities: s.totalLiabilities,
    }))
  }, [netWorthSnapshots])

  const lastSnapshot = netWorthSnapshots[netWorthSnapshots.length - 1]
  const change = lastSnapshot ? netWorth - lastSnapshot.netWorth : 0
  const changePercent =
    lastSnapshot && lastSnapshot.netWorth !== 0
      ? (change / Math.abs(lastSnapshot.netWorth)) * 100
      : 0

  const handleAdd = (kind: AssetLiabilityKind) => {
    setDialogKind(kind)
    setEditingItem(null)
    setDialogOpen(true)
  }

  const handleEdit = (item: NetWorthItem) => {
    setDialogKind(item.kind)
    setEditingItem(item)
    setDialogOpen(true)
  }

  const handleDelete = () => {
    if (!deleteConfirm) return
    deleteNetWorthItem(deleteConfirm.id)
    toast.success(`Deleted ${deleteConfirm.name}`)
    setDeleteConfirm(null)
  }

  const handleSaveSnapshot = () => {
    if (netWorthItems.length === 0) {
      toast.error("Add assets or liabilities first")
      return
    }
    const monthStart = startOfMonth(new Date()).toISOString().split("T")[0]
    const snapshot: NetWorthSnapshot = {
      id: `snap-${Date.now()}`,
      date: monthStart,
      totalAssets,
      totalLiabilities,
      netWorth,
    }
    addNetWorthSnapshot(snapshot)
    toast.success(`Snapshot saved for ${format(new Date(), "MMMM yyyy")}`)
  }

  if (!isLoaded) {
    return <NetWorthSkeleton />
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            Net Worth
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your total financial picture over time
          </p>
        </div>
        {netWorthItems.length > 0 && (
          <Button variant="outline" onClick={handleSaveSnapshot} className="gap-2">
            <Camera className="h-4 w-4" />
            Save Snapshot
          </Button>
        )}
      </div>

      {netWorthItems.length === 0 ? (
        <EmptyState onAdd={handleAdd} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Net Worth"
              value={formatAmount(netWorth)}
              sublabel={
                lastSnapshot
                  ? `${change >= 0 ? "+" : ""}${formatAmount(change)} (${changePercent.toFixed(1)}%) since last snapshot`
                  : "Save a snapshot to track changes"
              }
              variant={netWorth >= 0 ? "positive" : "negative"}
            />
            <StatCard
              label="Total Assets"
              value={formatAmount(totalAssets)}
              sublabel={`${assets.length} ${assets.length === 1 ? "account" : "accounts"}`}
            />
            <StatCard
              label="Total Liabilities"
              value={formatAmount(totalLiabilities)}
              sublabel={`${liabilities.length} ${liabilities.length === 1 ? "debt" : "debts"}`}
              variant={totalLiabilities > 0 ? "negative" : "default"}
            />
          </div>

          {chartData.length > 0 && (
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-medium">
                  Net Worth Over Time
                </CardTitle>
                <span className="text-xs text-muted-foreground">
                  {chartData.length} {chartData.length === 1 ? "snapshot" : "snapshots"}
                </span>
              </CardHeader>
              <CardContent className="pt-2">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="nwGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="oklch(0.55 0.15 150)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="oklch(0.55 0.15 150)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.922 0 0)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      stroke="oklch(0.556 0 0)"
                    />
                    <YAxis tick={{ fontSize: 12 }} stroke="oklch(0.556 0 0)" />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid oklch(0.922 0 0)",
                        fontSize: "13px",
                      }}
                      formatter={(value: number) => formatAmount(value)}
                    />
                    <Area
                      type="monotone"
                      dataKey="Net Worth"
                      stroke="oklch(0.55 0.15 150)"
                      strokeWidth={2}
                      fill="url(#nwGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>

                {chartData.length > 1 && (
                  <div className="mt-4">
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.922 0 0)" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12 }}
                          stroke="oklch(0.556 0 0)"
                        />
                        <YAxis tick={{ fontSize: 12 }} stroke="oklch(0.556 0 0)" />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            border: "1px solid oklch(0.922 0 0)",
                            fontSize: "13px",
                          }}
                          formatter={(value: number) => formatAmount(value)}
                        />
                        <Line
                          type="monotone"
                          dataKey="Assets"
                          stroke="oklch(0.6 0.118 184.704)"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="Liabilities"
                          stroke="oklch(0.646 0.222 27)"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                    <div className="flex items-center justify-center gap-6 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <div className="h-0.5 w-4 bg-[oklch(0.6_0.118_184.704)]" />
                        Assets
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-0.5 w-4 bg-[oklch(0.646_0.222_27)]" />
                        Liabilities
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ItemList
              title="Assets"
              items={assets}
              kind="asset"
              totalLabel="Total Assets"
              total={totalAssets}
              onAdd={() => handleAdd("asset")}
              onEdit={handleEdit}
              onDelete={setDeleteConfirm}
              icon={TrendingUp}
            />
            <ItemList
              title="Liabilities"
              items={liabilities}
              kind="liability"
              totalLabel="Total Liabilities"
              total={totalLiabilities}
              onAdd={() => handleAdd("liability")}
              onEdit={handleEdit}
              onDelete={setDeleteConfirm}
              icon={TrendingDown}
            />
          </div>

          {netWorthSnapshots.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">
                  Snapshot History
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2 pb-4">
                <div className="flex flex-col gap-1">
                  {[...netWorthSnapshots]
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((snap) => (
                      <div
                        key={snap.id}
                        className="flex items-center justify-between rounded-lg px-4 py-2.5 hover:bg-muted/50"
                      >
                        <span className="text-sm font-medium">
                          {format(parseISO(snap.date), "MMMM yyyy")}
                        </span>
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-semibold">
                              {formatAmount(snap.netWorth)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatAmount(snap.totalAssets)} -{" "}
                              {formatAmount(snap.totalLiabilities)}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => deleteNetWorthSnapshot(snap.id)}
                            aria-label="Delete snapshot"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <NetWorthItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        kind={dialogKind}
        existing={editingItem}
      />
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this {deleteConfirm?.kind}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove &quot;{deleteConfirm?.name}&quot;.
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

function ItemList({
  title,
  items,
  kind,
  totalLabel,
  total,
  onAdd,
  onEdit,
  onDelete,
  icon: Icon,
}: {
  title: string
  items: NetWorthItem[]
  kind: AssetLiabilityKind
  totalLabel: string
  total: number
  onAdd: () => void
  onEdit: (item: NetWorthItem) => void
  onDelete: (item: NetWorthItem) => void
  icon: typeof TrendingUp
}) {
  const { formatAmount } = useData()
  const categories = kind === "asset" ? ASSET_CATEGORIES : LIABILITY_CATEGORIES

  const getCategoryLabel = (catValue: string) =>
    categories.find((c) => c.value === catValue)?.label ?? catValue

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onAdd} className="gap-1.5 h-8">
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </CardHeader>
      <CardContent className="px-2 pb-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">No {title.toLowerCase()} yet</p>
            <Button variant="link" onClick={onAdd} className="text-xs">
              Add your first {kind}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-muted/50 group"
              >
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {getCategoryLabel(item.category)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold tabular-nums">
                    {formatAmount(item.balance)}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(item)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(item)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
            <div className="mt-2 flex items-center justify-between border-t px-3 pt-3">
              <span className="text-sm font-medium">{totalLabel}</span>
              <span className="text-sm font-semibold">{formatAmount(total)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function EmptyState({
  onAdd,
}: {
  onAdd: (kind: AssetLiabilityKind) => void
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
        <TrendingUp className="h-5 w-5 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-medium mb-1">Start tracking your net worth</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        Add your assets (cash, investments, property) and liabilities (credit
        cards, loans) to see your complete financial picture.
      </p>
      <div className="flex gap-3">
        <Button onClick={() => onAdd("asset")} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Asset
        </Button>
        <Button variant="outline" onClick={() => onAdd("liability")} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Liability
        </Button>
      </div>
    </div>
  )
}

function NetWorthSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-xl" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-60 rounded-xl" />
        <Skeleton className="h-60 rounded-xl" />
      </div>
    </div>
  )
}
