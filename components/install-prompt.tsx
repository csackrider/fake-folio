"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Download, X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

const DISMISSED_KEY = "fakefolio-install-dismissed"
const LEGACY_DISMISSED_KEY = "tallyr-install-dismissed"

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!localStorage.getItem(DISMISSED_KEY) && localStorage.getItem(LEGACY_DISMISSED_KEY)) {
      localStorage.setItem(DISMISSED_KEY, localStorage.getItem(LEGACY_DISMISSED_KEY)!)
      localStorage.removeItem(LEGACY_DISMISSED_KEY)
    }
    if (localStorage.getItem(DISMISSED_KEY)) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (!deferred) return
    await deferred.prompt()
    const choice = await deferred.userChoice
    if (choice.outcome === "accepted") {
      setVisible(false)
    }
    setDeferred(null)
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "1")
    setVisible(false)
  }

  if (!visible || !deferred) return null

  return (
    <Card className="fixed bottom-4 right-4 z-50 flex w-80 items-start gap-3 p-4 shadow-lg">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
        <Download className="h-4 w-4 text-primary" />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <p className="text-sm font-medium">Install FakeFolio</p>
        <p className="text-xs text-muted-foreground text-pretty">
          Add to your home screen for quicker access.
        </p>
        <div className="mt-2 flex items-center gap-2">
          <Button size="sm" onClick={handleInstall}>
            Install
          </Button>
          <Button size="sm" variant="ghost" onClick={handleDismiss}>
            Not now
          </Button>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0"
        onClick={handleDismiss}
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </Card>
  )
}
