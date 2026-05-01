"use client"

import { useEffect, useState } from "react"
import { AddEntryDialog } from "@/components/add-entry-dialog"

/**
 * Global keyboard shortcut handler. Press Cmd/Ctrl+N anywhere in the app
 * to open the Add Entry dialog.
 */
export function QuickEntryProvider() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Cmd+N on Mac, Ctrl+N on Windows/Linux
      const isModifier = e.metaKey || e.ctrlKey
      if (!isModifier) return
      if (e.key.toLowerCase() !== "n") return

      // Ignore if user is typing in an input/textarea/contentEditable
      const target = e.target as HTMLElement | null
      if (target) {
        const tag = target.tagName
        if (
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          tag === "SELECT" ||
          target.isContentEditable
        ) {
          return
        }
      }

      e.preventDefault()
      setOpen(true)
    }

    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  return <AddEntryDialog open={open} onOpenChange={setOpen} />
}
