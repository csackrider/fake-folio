"use client"

import { useMemo, useState } from "react"
import { useData } from "@/components/data-provider"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, Info, Scale, Users } from "lucide-react"
import { computeBalances, computeSettlements } from "@/lib/splits"
import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  parseISO,
  isWithinInterval,
  subMonths,
  format,
} from "date-fns"

type RangeOption = "month" | "3months" | "year" | "all"

export default function SplitsPage() {
  const { entries, members, formatAmount, isLoaded } = useData()
  const [range, setRange] = useState<RangeOption>("month")

  const filteredEntries = useMemo(() => {
    if (range === "all") return entries
    const now = new Date()
    let start: Date
    let end: Date
    if (range === "month") {
      start = startOfMonth(now)
      end = endOfMonth(now)
    } else if (range === "3months") {
      start = startOfMonth(subMonths(now, 2))
      end = endOfMonth(now)
    } else {
      start = startOfYear(now)
      end = endOfYear(now)
    }
    return entries.filter((e) =>
      isWithinInterval(parseISO(e.date), { start, end })
    )
  }, [entries, range])

  const balances = useMemo(
    () => computeBalances(filteredEntries, members),
    [filteredEntries, members]
  )

  const settlements = useMemo(() => computeSettlements(balances), [balances])

  const trackedEntries = useMemo(
    () =>
      filteredEntries.filter(
        (e) =>
          e.type === "expense" &&
          e.assignedTo === "shared" &&
          e.paidBy &&
          members.some((m) => m.id === e.paidBy)
      ),
    [filteredEntries, members]
  )

  const totalShared = useMemo(
    () => trackedEntries.reduce((sum, e) => sum + e.amount, 0),
    [trackedEntries]
  )

  if (!isLoaded) return null

  const rangeLabel =
    range === "month"
      ? format(new Date(), "MMMM yyyy")
      : range === "3months"
      ? "Last 3 months"
      : range === "year"
      ? format(new Date(), "yyyy")
      : "All time"

  return (
    <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Splits</h1>
          <p className="text-sm text-muted-foreground text-pretty">
            See who paid for shared expenses and how to settle up.
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
            <div>
              <CardTitle className="text-base">Time Range</CardTitle>
              <CardDescription>{rangeLabel}</CardDescription>
            </div>
            <div className="w-40">
              <Label htmlFor="range" className="sr-only">
                Range
              </Label>
              <Select value={range} onValueChange={(v) => setRange(v as RangeOption)}>
                <SelectTrigger id="range">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">This month</SelectItem>
                  <SelectItem value="3months">Last 3 months</SelectItem>
                  <SelectItem value="year">This year</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
        </Card>

        {members.length < 2 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
              <Users className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">Add household members</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Splits need at least two people in your household. Add them in Settings.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : trackedEntries.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
              <Info className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">No tracked shared expenses yet</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm text-pretty">
                  When you add a shared expense, set the &quot;Paid by&quot; field so we can
                  calculate who owes whom.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total shared</CardDescription>
                  <CardTitle className="text-2xl">{formatAmount(totalShared)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Across {trackedEntries.length}{" "}
                    {trackedEntries.length === 1 ? "entry" : "entries"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Per person share</CardDescription>
                  <CardTitle className="text-2xl">
                    {formatAmount(totalShared / Math.max(1, members.length))}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Split equally across {members.length} members
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Transactions to settle</CardDescription>
                  <CardTitle className="text-2xl">{settlements.length}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {settlements.length === 0 ? "Everyone is even" : "Shown below"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Balances */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Scale className="h-4 w-4" />
                  Balances
                </CardTitle>
                <CardDescription>
                  Positive means they should receive money. Negative means they owe.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {balances.map((b) => (
                    <div
                      key={b.memberId}
                      className="flex items-center justify-between gap-4 rounded-md border p-3"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{b.memberName}</span>
                        <span className="text-xs text-muted-foreground">
                          Paid {formatAmount(b.paid)} · Owes {formatAmount(b.owes)}
                        </span>
                      </div>
                      <Badge
                        variant={
                          Math.abs(b.net) < 0.01
                            ? "secondary"
                            : b.net > 0
                            ? "default"
                            : "destructive"
                        }
                      >
                        {b.net > 0 ? "+" : ""}
                        {formatAmount(b.net)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Settlements */}
            {settlements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Suggested Settlements</CardTitle>
                  <CardDescription>
                    The minimum set of transfers to settle all balances.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-3">
                    {settlements.map((s, idx) => (
                      <div
                        key={`${s.from}-${s.to}-${idx}`}
                        className="flex items-center gap-3 rounded-md border p-3"
                      >
                        <span className="font-medium">{s.fromName}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{s.toName}</span>
                        <Separator orientation="vertical" className="mx-auto h-5" />
                        <span className="ml-auto font-semibold">
                          {formatAmount(s.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
    </div>
  )
}
