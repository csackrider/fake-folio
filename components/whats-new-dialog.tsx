"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"
import {
  APP_VERSION,
  CHANGELOG,
  getChangesSinceVersion,
  type ChangelogEntry,
} from "@/lib/version"

const LAST_SEEN_VERSION_KEY = "fakefolio-last-seen-version"
const LEGACY_LAST_SEEN_VERSION_KEY = "tallyr-last-seen-version"

export function WhatsNewDialog() {
  const [open, setOpen] = useState(false)
  const [newChanges, setNewChanges] = useState<ChangelogEntry[]>([])

  useEffect(() => {
    let lastSeen = localStorage.getItem(LAST_SEEN_VERSION_KEY)
    if (!lastSeen) {
      const legacy = localStorage.getItem(LEGACY_LAST_SEEN_VERSION_KEY)
      if (legacy) {
        localStorage.setItem(LAST_SEEN_VERSION_KEY, legacy)
        localStorage.removeItem(LEGACY_LAST_SEEN_VERSION_KEY)
        lastSeen = legacy
      }
    }
    const changes = getChangesSinceVersion(lastSeen)
    
    if (changes.length > 0) {
      setNewChanges(changes)
      setOpen(true)
    }
  }, [])

  const handleClose = () => {
    // Mark current version as seen
    localStorage.setItem(LAST_SEEN_VERSION_KEY, APP_VERSION)
    setOpen(false)
  }

  if (newChanges.length === 0) return null

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            What&apos;s New in FakeFolio
          </DialogTitle>
          <DialogDescription>
            Here&apos;s what&apos;s been added since you last visited
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="flex flex-col gap-6">
            {newChanges.map((entry) => (
              <div key={entry.version} className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono text-xs">
                    v{entry.version}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{entry.date}</span>
                </div>
                <h3 className="font-medium">{entry.title}</h3>
                <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                  {entry.changes.map((change, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-2">
          <Button onClick={handleClose}>Got it</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Standalone button to manually open the changelog (for Settings page)
export function ViewChangelogButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="gap-2 text-muted-foreground">
        <Sparkles className="h-4 w-4" />
        What&apos;s New
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Changelog
            </DialogTitle>
            <DialogDescription>
              All updates and new features
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="flex flex-col gap-6">
              {CHANGELOG.map((entry) => (
                <div key={entry.version} className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono text-xs">
                      v{entry.version}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{entry.date}</span>
                  </div>
                  <h3 className="font-medium">{entry.title}</h3>
                  <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                    {entry.changes.map((change, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex justify-end pt-2">
            <Button onClick={() => setOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
