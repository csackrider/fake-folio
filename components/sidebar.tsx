"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Repeat,
  Wallet,
  List,
  BarChart3,
  Settings,
  LogOut,
  Target,
  Scale,
  SplitSquareHorizontal,
  CalendarCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useData } from "@/components/data-provider"
import { useAuth } from "@/components/auth-provider"
import type { PersonFilter } from "@/lib/types"

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Recurring", href: "/recurring", icon: Repeat },
  { label: "Budget", href: "/budget", icon: Wallet },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "Net Worth", href: "/net-worth", icon: Scale },
  { label: "Splits", href: "/splits", icon: SplitSquareHorizontal },
  { label: "Activity", href: "/activity", icon: List },
  { label: "Insights", href: "/insights", icon: BarChart3 },
  { label: "Month Review", href: "/month-review", icon: CalendarCheck },
  { label: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { members, personFilter, setPersonFilter } = useData()
  const { user, isAuthEnabled, signOut } = useAuth()

  // Build filter options dynamically: Combined + each member
  const filterOptions: { label: string; value: PersonFilter }[] = [
    { label: "Combined", value: "all" },
    ...members.map((m) => ({ label: m.name, value: m.id })),
  ]

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-sidebar px-4 py-6">
      <div className="mb-4 px-3">
        <h1 className="text-2xl font-semibold tracking-tight text-sidebar-foreground">
          FakeFolio
        </h1>
        <p className="text-xs text-muted-foreground">Personal finance, simplified</p>
      </div>

      <div className="mb-6 px-1">
        <div className="flex flex-wrap gap-1 rounded-lg bg-muted/60 p-0.5">
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPersonFilter(opt.value)}
              className={cn(
                "flex-1 min-w-[60px] rounded-md px-2 py-1.5 text-xs font-medium transition-colors truncate",
                personFilter === opt.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href)

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 text-sm font-medium",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          )
        })}

      </nav>

      <div className="mt-auto px-3 pt-4">
        {isAuthEnabled && user ? (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">All data stored locally</p>
        )}
      </div>
    </aside>
  )
}
