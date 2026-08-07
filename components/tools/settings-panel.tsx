"use client"

import { useRef } from "react"
import { Download, Monitor, Moon, RotateCcw, Settings, Sun, Upload } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmButton } from "@/components/ui/confirm-button"
import { Field } from "@/components/ui/field"
import { Select } from "@/components/ui/select"
import { useToast } from "@/components/ui/toast"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { navigationItems } from "@/components/navigation"
import {
  downloadJson,
  exportStudentHubData,
  importStudentHubData,
  resetStudentHubData,
} from "@/lib/storage"
import {
  ACCENT_COLORS,
  CALENDAR_VIEWS,
  type CalendarView,
  type StudentHubBackup,
  type ThemeMode,
} from "@/lib/types"
import { cn } from "@/lib/utils"
import { useSettings } from "@/hooks/use-settings"
import { useTheme } from "@/hooks/use-theme"

const themeOptions: Array<{
  icon: typeof Moon
  label: string
  value: ThemeMode
}> = [
  { icon: Moon, label: "Dark Mode", value: "dark" },
  { icon: Sun, label: "Light Mode", value: "light" },
  { icon: Monitor, label: "System Theme", value: "system" },
]

export function SettingsPanel() {
  const importInputRef = useRef<HTMLInputElement | null>(null)
  const { settings, updateSettings } = useSettings()
  const { accentColor, setAccentColor, setTheme, theme } = useTheme()
  const { toast } = useToast()

  function exportData() {
    downloadJson(`student-hub-backup-${new Date().toISOString().slice(0, 10)}.json`, exportStudentHubData())
    toast({
      message: "A JSON backup has been downloaded.",
      title: "Data exported",
      tone: "success",
    })
  }

  async function importData(file: File) {
    try {
      const text = await file.text()
      const backup = JSON.parse(text) as StudentHubBackup

      if (!backup.data || backup.version !== 1) {
        throw new Error("Invalid backup")
      }

      importStudentHubData(backup)
      toast({
        message: "Your Student Hub data was restored from the backup.",
        title: "Data imported",
        tone: "success",
      })
    } catch {
      toast({
        message: "Choose a valid Student Hub JSON backup.",
        title: "Import failed",
        tone: "error",
      })
    } finally {
      if (importInputRef.current) {
        importInputRef.current.value = ""
      }
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        description="Configure Student Hub preferences and workspace details."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {themeOptions.map((option) => {
                const Icon = option.icon

                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant={theme === option.value ? "default" : "ghost"}
                    onClick={() => setTheme(option.value)}
                    className={cn(
                      "h-20 flex-col rounded-2xl border border-white/10",
                      theme === option.value
                        ? "bg-blue-500/85 text-white hover:bg-blue-400"
                        : "bg-white/[0.04] text-zinc-100"
                    )}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                    {option.label}
                  </Button>
                )
              })}
            </div>

            <Field label="Accent Color">
              <div className="flex flex-wrap gap-2">
                {ACCENT_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setAccentColor(color.value)}
                    className={cn(
                      "flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-zinc-200 transition hover:-translate-y-0.5 hover:border-blue-400/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30",
                      accentColor === color.value && "border-blue-400/50 bg-blue-500/10"
                    )}
                  >
                    <span
                      className="size-4 rounded-full"
                      style={{ backgroundColor: color.value }}
                      aria-hidden="true"
                    />
                    {color.name}
                  </button>
                ))}
              </div>
            </Field>
            <Badge tone="blue">Current accent {accentColor}</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Field label="Default Dashboard Page">
              <Select
                value={settings.defaultDashboardPage}
                onChange={(event) =>
                  updateSettings({ defaultDashboardPage: event.target.value })
                }
              >
                {navigationItems.map((item) => (
                  <option key={item.href} value={item.href}>
                    {item.title}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Default Calendar View">
              <Select
                value={settings.defaultCalendarView}
                onChange={(event) =>
                  updateSettings({
                    defaultCalendarView: event.target.value as CalendarView,
                  })
                }
              >
                {CALENDAR_VIEWS.map((view) => (
                  <option key={view} value={view}>
                    {view}
                  </option>
                ))}
              </Select>
            </Field>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Data</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={exportData}
              className="h-10 rounded-xl bg-blue-500/85 px-4 text-white hover:bg-blue-400"
            >
              <Download className="size-4" aria-hidden="true" />
              Export JSON
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => importInputRef.current?.click()}
              className="h-10 rounded-xl border border-white/10 bg-white/[0.04] text-zinc-100"
            >
              <Upload className="size-4" aria-hidden="true" />
              Import Backup
            </Button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]

                if (file) {
                  importData(file)
                }
              }}
            />
            <ConfirmButton
              type="button"
              variant="destructive"
              confirmMessage="Reset all Student Hub data? This cannot be undone."
              onConfirm={() => {
                resetStudentHubData()
                toast({
                  message: "All local Student Hub data was reset.",
                  title: "Data reset",
                  tone: "info",
                })
              }}
              className="h-10 rounded-xl"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Reset All Data
            </ConfirmButton>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="flex items-center gap-3 pt-5 text-sm text-zinc-500">
            <Settings className="size-4 text-blue-300" aria-hidden="true" />
            All settings and student data stay in this browser through localStorage.
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}

