"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string
  sublabel?: string
  variant?: "default" | "positive" | "negative"
}

export function StatCard({ label, value, sublabel, variant = "default" }: StatCardProps) {
  return (
    <Card className="flex-1">
      <CardContent className="flex flex-col gap-1 p-6">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p
          className={cn(
            "text-2xl font-semibold tracking-tight",
            variant === "positive" && "text-emerald-600",
            variant === "negative" && "text-destructive"
          )}
        >
          {value}
        </p>
        {sublabel && (
          <p className="text-xs text-muted-foreground">{sublabel}</p>
        )}
      </CardContent>
    </Card>
  )
}
