"use client"

import { useState, useEffect, useRef } from "react"
import { useData } from "@/components/data-provider"
import { CURRENCIES } from "@/lib/constants"
import type { CurrencyCode, Theme, Entry, BudgetCategory, HouseholdMember, AppSettings } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Download, Upload, Plus, X, FileSpreadsheet, FileText, Cloud } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { CsvImportDialog } from "@/components/csv-import-dialog"
import { exportInsightsPDF } from "@/lib/pdf-export"
import { hasLocalDataToMigrate } from "@/lib/storage"
import { ViewChangelogButton } from "@/components/whats-new-dialog"
import { APP_VERSION } from "@/lib/version"

const GROUPS = [
  { key: "common" as const, label: "Common" },
  { key: "nordic" as const, label: "Nordic" },
  { key: "other" as const, label: "Other" },
]

function generateMemberId(): string {
  return `person-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export default function SettingsPage() {
  const { currency, theme, members, entries, budgetCategories, saveAllSettings, getBackupData, restoreBackup, formatAmount, isLoaded, isCloudMode, migrateLocalDataToCloud } = useData()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [csvOpen, setCsvOpen] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  const [hasLocalData, setHasLocalData] = useState(false)

  // Check for local data on mount
  useEffect(() => {
    setHasLocalData(hasLocalDataToMigrate())
  }, [])

  // Local draft state for buffering changes until Save
  const [draftCurrency, setDraftCurrency] = useState<CurrencyCode>(currency)
  const [draftTheme, setDraftTheme] = useState<Theme>(theme)
  const [draftMembers, setDraftMembers] = useState<HouseholdMember[]>(members)

  // Sync drafts when context values load
  useEffect(() => {
    if (isLoaded) {
      setDraftCurrency(currency)
      setDraftTheme(theme)
      setDraftMembers(members)
    }
  }, [isLoaded, currency, theme, members])

  const membersChanged = () => {
    if (draftMembers.length !== members.length) return true
    return draftMembers.some((dm, i) => dm.id !== members[i]?.id || dm.name !== members[i]?.name)
  }

  const hasChanges =
    draftCurrency !== currency ||
    draftTheme !== theme ||
    membersChanged()

  const handleSave = () => {
    saveAllSettings({
      currency: draftCurrency,
      theme: draftTheme,
      members: draftMembers,
    })
    toast.success("Settings saved")
  }

  const handleAddMember = () => {
    const newMember: HouseholdMember = {
      id: generateMemberId(),
      name: `Person ${draftMembers.length + 1}`,
    }
    setDraftMembers([...draftMembers, newMember])
  }

  const handleRemoveMember = (id: string) => {
    if (draftMembers.length <= 1) {
      toast.error("You must have at least one household member")
      return
    }
    setDraftMembers(draftMembers.filter((m) => m.id !== id))
  }

  const handleMemberNameChange = (id: string, name: string) => {
    setDraftMembers(draftMembers.map((m) => (m.id === id ? { ...m, name } : m)))
  }

  const handleMigrateData = async () => {
    setIsMigrating(true)
    const success = await migrateLocalDataToCloud()
    setIsMigrating(false)
    if (success) {
      toast.success("Data migrated to cloud successfully")
    } else {
      toast.error("Failed to migrate data")
    }
  }

  const handleExportPDF = () => {
    exportInsightsPDF(entries, budgetCategories, formatAmount)
    toast.success("PDF exported")
  }

  const handleExportBackup = () => {
    const data = getBackupData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `tallyr-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Backup exported")
  }

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string) as {
          entries: Entry[]
          budgetCategories: BudgetCategory[]
          settings: AppSettings
        }
        
        // Basic validation
        if (!Array.isArray(data.entries) || !Array.isArray(data.budgetCategories) || !data.settings) {
          throw new Error("Invalid backup format")
        }
        
        restoreBackup(data)
        // Update draft state to match restored settings
        setDraftCurrency(data.settings.currency)
        setDraftTheme(data.settings.theme)
        setDraftMembers(data.settings.members)
        toast.success("Backup restored successfully")
      } catch {
        toast.error("Failed to restore backup. Invalid file format.")
      }
    }
    reader.readAsText(file)
    
    // Reset file input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  const selectedInfo = CURRENCIES.find((c) => c.code === draftCurrency)

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Currency</CardTitle>
          <CardDescription>
            Choose the currency used across all screens. This changes how amounts are displayed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <Label htmlFor="currency-select" className="shrink-0 text-sm font-medium">
              Display currency
            </Label>
            <Select
              value={draftCurrency}
              onValueChange={(val) => setDraftCurrency(val as CurrencyCode)}
            >
              <SelectTrigger id="currency-select" className="w-full sm:w-72">
                <SelectValue>
                  {selectedInfo ? `${selectedInfo.symbol}  ${selectedInfo.label} (${selectedInfo.code})` : currency}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {GROUPS.map((group) => (
                  <SelectGroup key={group.key}>
                    <SelectLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {group.label}
                    </SelectLabel>
                    {CURRENCIES.filter((c) => c.group === group.key).map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        <span className="inline-flex items-center gap-2">
                          <span className="w-8 text-right font-mono text-xs text-muted-foreground">
                            {c.symbol}
                          </span>
                          <span>{c.label}</span>
                          <span className="text-xs text-muted-foreground">({c.code})</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Household</CardTitle>
          <CardDescription>
            Set names for people sharing this budget. These names appear in the sidebar filter and on each entry.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {draftMembers.map((member, index) => (
              <div key={member.id} className="flex items-center gap-2">
                <Input
                  value={member.name}
                  onChange={(e) => handleMemberNameChange(member.id, e.target.value)}
                  placeholder={`Person ${index + 1}`}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveMember(member.id)}
                  disabled={draftMembers.length <= 1}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove {member.name}</span>
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddMember}
              className="w-fit gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Person
            </Button>
          </div>
        </CardContent>
      </Card>

      {isCloudMode && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              Cloud Sync
            </CardTitle>
            <CardDescription>
              Your data is synced to the cloud and will persist across devices.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {isCloudMode && entries.length === 0 && hasLocalData && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">Migrate Local Data</CardTitle>
            <CardDescription>
              You have local data stored in your browser. Would you like to migrate it to the cloud?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleMigrateData} disabled={isMigrating} className="gap-2">
              {isMigrating ? "Migrating..." : "Migrate Data to Cloud"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data and Files</CardTitle>
          <CardDescription>
            Import transactions, export reports, or backup your data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => setCsvOpen(true)} className="gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Import CSV
              </Button>
              <Button variant="outline" onClick={handleExportPDF} className="gap-2">
                <FileText className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-3">Backup & Restore</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={handleExportBackup} className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Backup
                </Button>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                    id="backup-file-input"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Import Backup
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
          <CardDescription>
            Switch between light, dark, or system theme.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <Label htmlFor="theme-select" className="shrink-0 text-sm font-medium">
              Theme
            </Label>
            <Select
              value={draftTheme}
              onValueChange={(val) => setDraftTheme(val as Theme)}
            >
              <SelectTrigger id="theme-select" className="w-full sm:w-72">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <CsvImportDialog open={csvOpen} onOpenChange={setCsvOpen} />

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!hasChanges}>
          Save
        </Button>
      </div>

      <div className="flex items-center justify-between border-t pt-6 text-sm text-muted-foreground">
        <span>Tallyr v{APP_VERSION}</span>
        <ViewChangelogButton />
      </div>
    </div>
  )
}
