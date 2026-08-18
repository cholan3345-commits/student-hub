"use client"

import { useRef, useState } from "react"
import { Download, Monitor, Moon, RotateCcw, Settings, Sun, Upload } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmButton } from "@/components/ui/confirm-button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
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
  const [customAccentDraft, setCustomAccentDraft] = useState({
    source: accentColor,
    value: accentColor,
  })
  const customAccent =
    customAccentDraft.source === accentColor ? customAccentDraft.value : accentColor
  const { toast } = useToast()

  function applyAccentColor(color: string) {
    const nextColor = color.trim()

    setCustomAccentDraft({
      source: isValidHexColor(nextColor) ? nextColor.toLowerCase() : accentColor,
      value: nextColor,
    })

    if (isValidHexColor(nextColor)) {
      setAccentColor(nextColor)
    }
  }

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
                        ? "hub-accent-bg"
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
                    onClick={() => applyAccentColor(color.value)}
                    className={cn(
                      "hub-focus flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-zinc-200 transition-[color,background-color,border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-[var(--hub-accent-border)]",
                      accentColor === color.value && "hub-accent-soft"
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
            <Field label="Custom Accent">
              <div className="grid gap-2 sm:grid-cols-[5rem_1fr]">
                <Input
                  type="color"
                  value={normalizeColorInput(customAccent, accentColor)}
                  onChange={(event) => applyAccentColor(event.target.value)}
                  className="h-10 w-20 p-1"
                  aria-label="Pick custom accent color"
                />
                <Input
                  value={customAccent}
                  onChange={(event) => applyAccentColor(event.target.value)}
                  placeholder="#8B5CF6"
                  aria-label="Custom accent HEX value"
                  aria-invalid={customAccent.length > 0 && !isValidHexColor(customAccent)}
                  className={cn(
                    "font-mono uppercase",
                    customAccent.length > 0 &&
                      !isValidHexColor(customAccent) &&
                      "border-red-400/50 focus-visible:border-red-400/60 focus-visible:ring-red-500/20"
                  )}
                />
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
              className="h-10 rounded-xl px-4"
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
          <CardContent className="flex items-center gap-3 pt-4 text-sm text-zinc-500 sm:pt-5">
            <Settings className="size-4 text-[var(--hub-accent)]" aria-hidden="true" />
            All settings and student data stay in this browser through localStorage.
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}

function normalizeColorInput(color: string, fallback = "#3b82f6") {
  return isValidHexColor(color) ? color : fallback
}

function isValidHexColor(color: string) {
  return /^#[0-9a-f]{6}$/i.test(color)
}
