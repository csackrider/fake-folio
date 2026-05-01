"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { QuickEntryProvider } from "@/components/quick-entry-provider"
import { InstallPrompt } from "@/components/install-prompt"
import { WhatsNewDialog } from "@/components/whats-new-dialog"

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  // Auth pages render without the shell
  if (pathname?.startsWith("/auth")) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <ScrollArea className="flex-1">
        <main className="mx-auto max-w-6xl px-8 py-8">{children}</main>
      </ScrollArea>
      <QuickEntryProvider />
      <InstallPrompt />
      <WhatsNewDialog />
    </div>
  )
}
