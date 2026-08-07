"use client"

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
} from "react"
import Link from "next/link"
import {
  ArrowDown,
  ArrowUp,
  CalendarClock,
  CalendarDays,
  Calculator,
  CheckCircle2,
  ClipboardList,
  Clock,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  ListChecks,
  Maximize2,
  NotebookPen,
  Pin,
  PinOff,
  Plus,
  RotateCcw,
  Settings,
  SlidersHorizontal,
  TimerReset,
  Upload,
  X,
  type LucideIcon,
} from "lucide-react"

import { DashboardCard } from "@/components/dashboard/dashboard-card"
import { navigationItems } from "@/components/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import {
  NAVBAR_CONTROLS,
  useWorkspacePreferences,
} from "@/hooks/use-workspace-preferences"
import { useAssignments } from "@/hooks/use-assignments"
import { useCalculatorHistory } from "@/hooks/use-calculator-history"
import { useCalendarEvents } from "@/hooks/use-calendar-events"
import { useDashboardLayout } from "@/hooks/use-dashboard-layout"
import { useDraggable } from "@/hooks/use-draggable"
import { useNotes } from "@/hooks/use-notes"
import { pomodoroModeLabels, usePomodoro } from "@/hooks/use-pomodoro"
import { useResizable } from "@/hooks/use-resizable"
import { useSchedule } from "@/hooks/use-schedule"
import { useTheme } from "@/hooks/use-theme"
import { useWidgetSettings } from "@/hooks/use-widget-settings"
import {
  DASHBOARD_WIDGET_COPY,
  QUICK_ACTIONS,
} from "@/lib/dashboard"
import {
  compareDateKeys,
  compareTimes,
  formatDateLabel,
  formatTime,
  getWeekday,
  isPastDate,
  isWithinNextDays,
} from "@/lib/date"
import { getAgendaForDate } from "@/lib/derived"
import {
  ACCENT_COLORS,
  THEME_MODES,
  WEEKDAYS,
  type Assignment,
  type CalendarEvent,
  type DashboardWidget,
  type DashboardWidgetKind,
  type DashboardWidgetSettings,
  type DashboardWidgetSize,
  type QuickActionId,
  type ScheduleItem,
  type ThemeMode,
} from "@/lib/types"
import { cn } from "@/lib/utils"

const widgetIcons: Record<DashboardWidgetKind, LucideIcon> = {
  assignments: ClipboardList,
  calculator: Calculator,
  calendar: CalendarDays,
  "classes-today": CalendarClock,
  "completed-assignments": CheckCircle2,
  "current-date": CalendarDays,
  "current-time": Clock,
  notes: NotebookPen,
  "quick-actions": Plus,
  "remaining-assignments": ListChecks,
  schedule: CalendarClock,
  timer: TimerReset,
  "total-assignments": ClipboardList,
  "upcoming-deadlines": Clock,
}

const themeLabels: Record<ThemeMode, string> = {
  amoled: "AMOLED",
  blue: "Blue",
  dark: "Dark",
  green: "Green",
  light: "Light",
  midnight: "Midnight",
  purple: "Purple",
  system: "System",
}

type DashboardContext = {
  activeAssignments: Assignment[]
  assignments: Assignment[]
  completedAssignments: Assignment[]
  events: CalendarEvent[]
  history: ReturnType<typeof useCalculatorHistory>["history"]
  moveQuickAction: (draggedId: QuickActionId, targetId: QuickActionId) => void
  notes: ReturnType<typeof useNotes>["notes"]
  now: Date | null
  pause: () => void
  progress: number
  quickActions: QuickActionId[]
  remainingSeconds: number
  reset: () => void
  schedules: ScheduleItem[]
  setMode: ReturnType<typeof usePomodoro>["setMode"]
  start: () => void
  state: ReturnType<typeof usePomodoro>["state"]
  totalSeconds: number
  upcomingDeadlines: Assignment[]
}

export function DashboardPage() {
  const dashboardLayout = useDashboardLayout()
  const { assignments } = useAssignments()
  const { history } = useCalculatorHistory()
  const { events } = useCalendarEvents()
  const { notes } = useNotes()
  const { schedules } = useSchedule()
  const {
    pause,
    progress,
    remainingSeconds,
    reset,
    setMode,
    start,
    state,
    totalSeconds,
  } = usePomodoro()
  const [now, setNow] = useState<Date | null>(null)
  const [maximizedWidgetId, setMaximizedWidgetId] = useState<string | null>(null)
  const gridColumns = useDashboardColumns()

  useEffect(() => {
    const tick = () => setNow(new Date())
    const timeout = window.setTimeout(tick, 0)
    const interval = window.setInterval(() => setNow(new Date()), 1000)

    return () => {
      window.clearTimeout(timeout)
      window.clearInterval(interval)
    }
  }, [])

  const activeAssignments = useMemo(
    () =>
      assignments
        .filter((assignment) => assignment.status !== "Completed")
        .sort((a, b) => compareDateKeys(a.dueDate, b.dueDate)),
    [assignments]
  )
  const completedAssignments = useMemo(
    () => assignments.filter((assignment) => assignment.status === "Completed"),
    [assignments]
  )
  const upcomingDeadlines = useMemo(
    () =>
      activeAssignments.filter((assignment) =>
        isWithinNextDays(assignment.dueDate, 7)
      ),
    [activeAssignments]
  )
  const maximizedWidget =
    dashboardLayout.activePreset.widgets.find(
      (widget) => widget.id === maximizedWidgetId
    ) ?? null
  const context: DashboardContext = {
    activeAssignments,
    assignments,
    completedAssignments,
    events,
    history,
    moveQuickAction: dashboardLayout.moveQuickAction,
    notes,
    now,
    pause,
    progress,
    quickActions: dashboardLayout.activePreset.quickActions,
    remainingSeconds,
    reset,
    schedules,
    setMode,
    start,
    state,
    totalSeconds,
    upcomingDeadlines,
  }

  return (
    <PageContent>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-normal text-zinc-50 sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
            A customizable workspace for classes, assignments, notes, study tools,
            and files.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => dashboardLayout.setCustomizeMode(!dashboardLayout.customizeMode)}
          className={cn(
            "h-11 rounded-xl px-4 text-white",
            dashboardLayout.customizeMode
              ? "bg-emerald-500/85 hover:bg-emerald-400"
              : "bg-blue-500/85 hover:bg-blue-400"
          )}
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          {dashboardLayout.customizeMode ? "Done Customizing" : "Customize Dashboard"}
        </Button>
      </div>

      {dashboardLayout.customizeMode ? (
        <DashboardCustomizePanel layout={dashboardLayout} />
      ) : null}

      <section
        className="grid gap-4"
        style={{
          gridAutoFlow: "row dense",
          gridAutoRows: "minmax(72px, auto)",
          gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
        }}
      >
        {dashboardLayout.visibleWidgets.map((widget) => (
          <DashboardWidgetShell
            key={widget.id}
            columns={gridColumns}
            customizeMode={dashboardLayout.customizeMode}
            duplicateWidget={dashboardLayout.duplicateWidget}
            hideWidget={dashboardLayout.hideWidget}
            moveWidget={dashboardLayout.moveWidget}
            onMaximize={() => setMaximizedWidgetId(widget.id)}
            resizeWidget={dashboardLayout.resizeWidget}
            setWidgetSize={dashboardLayout.setWidgetSize}
            togglePinWidget={dashboardLayout.togglePinWidget}
            updateWidgetSettings={dashboardLayout.updateWidgetSettings}
            widget={widget}
          >
            {renderWidgetContent(widget, context, dashboardLayout.customizeMode)}
          </DashboardWidgetShell>
        ))}
      </section>

      {maximizedWidget ? (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-4 backdrop-blur">
          <div className="w-full max-w-5xl">
            <DashboardCard
              title={DASHBOARD_WIDGET_COPY[maximizedWidget.kind].title}
              description={DASHBOARD_WIDGET_COPY[maximizedWidget.kind].description}
              icon={widgetIcons[maximizedWidget.kind]}
              actions={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-lg"
                  aria-label="Close maximized widget"
                  onClick={() => setMaximizedWidgetId(null)}
                  className="size-10 rounded-xl text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100"
                >
                  <X className="size-5" aria-hidden="true" />
                </Button>
              }
              className="max-h-[86vh] overflow-y-auto"
            >
              {renderWidgetContent(maximizedWidget, context, false)}
            </DashboardCard>
          </div>
        </div>
      ) : null}
    </PageContent>
  )
}

function PageContent({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-[92rem] px-4 py-6 sm:px-6 lg:px-8">{children}</div>
}

function DashboardWidgetShell({
  children,
  columns,
  customizeMode,
  duplicateWidget,
  hideWidget,
  moveWidget,
  onMaximize,
  resizeWidget,
  setWidgetSize,
  togglePinWidget,
  updateWidgetSettings,
  widget,
}: {
  children: React.ReactNode
  columns: number
  customizeMode: boolean
  duplicateWidget: (widgetId: string) => void
  hideWidget: (widgetId: string) => void
  moveWidget: (draggedId: string, targetId: string) => void
  onMaximize: () => void
  resizeWidget: (widgetId: string, colSpan: number, rowSpan: number) => void
  setWidgetSize: (widgetId: string, size: DashboardWidgetSize) => void
  togglePinWidget: (widgetId: string) => void
  updateWidgetSettings: (
    widgetId: string,
    settings: DashboardWidgetSettings
  ) => void
  widget: DashboardWidget
}) {
  const span = Math.max(1, Math.min(widget.colSpan, columns))
  const Icon = widgetIcons[widget.kind]
  const copy = DASHBOARD_WIDGET_COPY[widget.kind]
  const { handleProps: dragHandleProps, isDragging } = useDraggable({
    disabled: !customizeMode,
    id: widget.id,
    onMove: moveWidget,
    targetSelector: "[data-dashboard-widget]",
  })
  const { handleProps: resizeHandleProps, isResizing } = useResizable({
    colSpan: widget.colSpan,
    disabled: !customizeMode,
    maxColSpan: Math.max(2, columns),
    onResize: (colSpan, rowSpan) => resizeWidget(widget.id, colSpan, rowSpan),
    rowSpan: widget.rowSpan,
  })
  const widgetStyle: CSSProperties = {
    gridColumn: `span ${span} / span ${span}`,
    minHeight: Math.max(180, widget.rowSpan * 88),
  }

  return (
    <div
      data-dashboard-widget
      data-drag-id={widget.id}
      className={cn(
        "relative min-w-0 transition duration-200",
        isDragging && "scale-[0.985] opacity-70",
        isResizing && "ring-2 ring-blue-400/40",
        widget.pinned && "order-first"
      )}
      style={widgetStyle}
    >
      <DashboardCard
        title={copy.title}
        description={copy.description}
        icon={Icon}
        actions={
          <div className="flex shrink-0 items-center gap-1">
            {widget.pinned ? (
              <Pin className="size-4 fill-blue-300 text-blue-300" aria-hidden="true" />
            ) : null}
            {customizeMode ? (
              <button
                type="button"
                {...dragHandleProps}
                aria-label="Drag widget"
                className="grid size-9 cursor-grab place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-400 transition hover:bg-white/[0.07] hover:text-zinc-100 active:cursor-grabbing"
              >
                <GripVertical className="size-4" aria-hidden="true" />
              </button>
            ) : null}
            <DashboardWidgetMenu
              duplicateWidget={duplicateWidget}
              hideWidget={hideWidget}
              onMaximize={onMaximize}
              setWidgetSize={setWidgetSize}
              togglePinWidget={togglePinWidget}
              updateWidgetSettings={updateWidgetSettings}
              widget={widget}
            />
          </div>
        }
        className={cn(
          "h-full overflow-hidden",
          customizeMode && "ring-1 ring-blue-400/20"
        )}
        contentClassName="h-[calc(100%-5.5rem)] overflow-y-auto"
      >
        {children}
      </DashboardCard>
      {customizeMode ? (
        <button
          type="button"
          {...resizeHandleProps}
          className="absolute bottom-2 right-2 grid size-7 cursor-nwse-resize place-items-center rounded-lg border border-blue-400/30 bg-blue-500/20 text-blue-100 shadow-lg shadow-black/30"
        >
          <Maximize2 className="size-3.5" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  )
}

function DashboardWidgetMenu({
  duplicateWidget,
  hideWidget,
  onMaximize,
  setWidgetSize,
  togglePinWidget,
  updateWidgetSettings,
  widget,
}: {
  duplicateWidget: (widgetId: string) => void
  hideWidget: (widgetId: string) => void
  onMaximize: () => void
  setWidgetSize: (widgetId: string, size: DashboardWidgetSize) => void
  togglePinWidget: (widgetId: string) => void
  updateWidgetSettings: (
    widgetId: string,
    settings: DashboardWidgetSettings
  ) => void
  widget: DashboardWidget
}) {
  const [open, setOpen] = useState(false)
  const { setSize, updateSettings } = useWidgetSettings({
    setWidgetSize,
    updateWidgetSettings,
    widget,
  })

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        aria-label="Widget settings"
        onClick={() => setOpen((current) => !current)}
        className="size-9 rounded-xl text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100"
      >
        <Settings className="size-4" aria-hidden="true" />
      </Button>
      {open ? (
        <div className="absolute right-0 top-11 z-50 w-72 rounded-2xl border border-white/10 bg-[#111827]/98 p-3 text-sm shadow-2xl shadow-black/40 backdrop-blur">
          <Field label="Widget Size">
            <div className="grid grid-cols-3 gap-2">
              {(["small", "medium", "large"] as DashboardWidgetSize[]).map((size) => (
                <Button
                  key={size}
                  type="button"
                  variant={widget.size === size ? "default" : "ghost"}
                  onClick={() => setSize(size)}
                  className={cn(
                    "h-9 rounded-xl capitalize",
                    widget.size === size
                      ? "bg-blue-500/85 text-white"
                      : "border border-white/10 bg-white/[0.04] text-zinc-200"
                  )}
                >
                  {size}
                </Button>
              ))}
            </div>
          </Field>

          <WidgetSettingControl widget={widget} updateSettings={updateSettings} />

          <div className="mt-3 grid gap-2">
            <MenuButton icon={Maximize2} label="Maximize" onClick={onMaximize} />
            <MenuButton
              icon={widget.pinned ? PinOff : Pin}
              label={widget.pinned ? "Unpin Widget" : "Pin Widget"}
              onClick={() => togglePinWidget(widget.id)}
            />
            <MenuButton
              icon={Copy}
              label="Duplicate Widget"
              onClick={() => duplicateWidget(widget.id)}
            />
            <MenuButton
              icon={EyeOff}
              label="Hide Widget"
              onClick={() => hideWidget(widget.id)}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}

function WidgetSettingControl({
  updateSettings,
  widget,
}: {
  updateSettings: (settings: DashboardWidgetSettings) => void
  widget: DashboardWidget
}) {
  if (widget.kind === "calendar") {
    return (
      <Field label="Calendar View" className="mt-3">
        <Select
          value={widget.settings.calendarView ?? "day"}
          onChange={(event) =>
            updateSettings({
              calendarView: event.target.value as NonNullable<
                DashboardWidgetSettings["calendarView"]
              >,
            })
          }
        >
          <option value="month">Month</option>
          <option value="week">Week</option>
          <option value="day">Day</option>
        </Select>
      </Field>
    )
  }

  if (widget.kind === "assignments") {
    return (
      <Field label="Assignments View" className="mt-3">
        <Select
          value={widget.settings.assignmentsView ?? "upcoming"}
          onChange={(event) =>
            updateSettings({
              assignmentsView: event.target.value as NonNullable<
                DashboardWidgetSettings["assignmentsView"]
              >,
            })
          }
        >
          <option value="upcoming">Upcoming</option>
          <option value="overdue">Overdue</option>
          <option value="completed">Completed</option>
        </Select>
      </Field>
    )
  }

  if (widget.kind === "schedule") {
    return (
      <Field label="Schedule View" className="mt-3">
        <Select
          value={widget.settings.scheduleView ?? "today"}
          onChange={(event) =>
            updateSettings({
              scheduleView: event.target.value as NonNullable<
                DashboardWidgetSettings["scheduleView"]
              >,
            })
          }
        >
          <option value="today">Today</option>
          <option value="tomorrow">Tomorrow</option>
          <option value="week">Week</option>
        </Select>
      </Field>
    )
  }

  if (widget.kind === "notes") {
    return (
      <Field label="Notes View" className="mt-3">
        <Select
          value={widget.settings.notesView ?? "recent"}
          onChange={(event) =>
            updateSettings({
              notesView: event.target.value as NonNullable<
                DashboardWidgetSettings["notesView"]
              >,
            })
          }
        >
          <option value="recent">Recent</option>
          <option value="favorites">Favorites</option>
        </Select>
      </Field>
    )
  }

  if (widget.kind === "calculator") {
    return (
      <Field label="Calculator View" className="mt-3">
        <Select
          value={widget.settings.calculatorView ?? "compact"}
          onChange={(event) =>
            updateSettings({
              calculatorView: event.target.value as NonNullable<
                DashboardWidgetSettings["calculatorView"]
              >,
            })
          }
        >
          <option value="compact">Compact</option>
          <option value="expanded">Expanded</option>
        </Select>
      </Field>
    )
  }

  if (widget.kind === "timer") {
    return (
      <Field label="Timer View" className="mt-3">
        <Select
          value={widget.settings.timerView ?? "compact"}
          onChange={(event) =>
            updateSettings({
              timerView: event.target.value as NonNullable<
                DashboardWidgetSettings["timerView"]
              >,
            })
          }
        >
          <option value="compact">Compact</option>
          <option value="full">Full</option>
        </Select>
      </Field>
    )
  }

  return (
    <Field label="Widget View" className="mt-3">
      <Select value="live" onChange={() => undefined}>
        <option value="live">Live Metric</option>
      </Select>
    </Field>
  )
}

function MenuButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-9 items-center gap-2 rounded-xl px-2 text-left text-zinc-300 transition hover:bg-white/[0.06] hover:text-zinc-100"
    >
      <Icon className="size-4" aria-hidden="true" />
      {label}
    </button>
  )
}

function DashboardCustomizePanel({
  layout,
}: {
  layout: ReturnType<typeof useDashboardLayout>
}) {
  const wallpaperInputRef = useRef<HTMLInputElement | null>(null)
  const [layoutNameDrafts, setLayoutNameDrafts] = useState<Record<string, string>>({})
  const [newLayoutName, setNewLayoutName] = useState("")
  const {
    moveNavbarControl,
    moveSidebarItem,
    preferences,
    toggleNavbarHidden,
    toggleSidebarHidden,
    toggleSidebarPinned,
    updateBackground,
    updateSidebar,
  } = useWorkspacePreferences()
  const { accentColor, setAccentColor, setTheme, theme } = useTheme()
  const orderedNavigationItems = useMemo(() => {
    const byHref = new Map(navigationItems.map((item) => [item.href, item]))

    return preferences.sidebar.order
      .map((href) => byHref.get(href))
      .filter((item): item is (typeof navigationItems)[number] => Boolean(item))
  }, [preferences.sidebar.order])

  const layoutName =
    layoutNameDrafts[layout.activePreset.id] ?? layout.activePreset.name

  async function uploadWallpaper(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const wallpaperDataUrl = await readFileAsDataUrl(file)
    updateBackground({ mode: "wallpaper", wallpaperDataUrl })
    event.target.value = ""
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Customize Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="grid gap-4 xl:grid-cols-3">
          <Field label="Active Layout">
            <Select
              value={layout.activePreset.id}
              onChange={(event) => layout.switchPreset(event.target.value)}
            >
              {layout.presets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Rename Layout">
            <div className="flex gap-2">
              <Input
                value={layoutName}
                onChange={(event) =>
                  setLayoutNameDrafts((current) => ({
                    ...current,
                    [layout.activePreset.id]: event.target.value,
                  }))
                }
              />
              <Button
                type="button"
                onClick={() => layout.renamePreset(layout.activePreset.id, layoutName)}
                className="h-10 rounded-xl bg-blue-500/85 px-3 text-white"
              >
                Save
              </Button>
            </div>
          </Field>
          <Field label="Create Layout">
            <div className="flex gap-2">
              <Input
                value={newLayoutName}
                onChange={(event) => setNewLayoutName(event.target.value)}
                placeholder="Layout name"
              />
              <Button
                type="button"
                onClick={() => {
                  layout.createPreset(newLayoutName)
                  setNewLayoutName("")
                }}
                className="h-10 rounded-xl bg-blue-500/85 px-3 text-white"
              >
                <Plus className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </Field>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => layout.duplicatePreset(layout.activePreset.id)}
            className="h-10 rounded-xl border border-white/10 bg-white/[0.04] text-zinc-100"
          >
            <Copy className="size-4" aria-hidden="true" />
            Duplicate Layout
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={layout.resetActivePreset}
            className="h-10 rounded-xl border border-white/10 bg-white/[0.04] text-zinc-100"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Reset Layout
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => layout.deletePreset(layout.activePreset.id)}
            className="h-10 rounded-xl"
          >
            <X className="size-4" aria-hidden="true" />
            Delete Layout
          </Button>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Hidden Widgets</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {layout.hiddenWidgets.length > 0 ? (
                layout.hiddenWidgets.map((widget) => (
                  <Button
                    key={widget.id}
                    type="button"
                    variant="ghost"
                    onClick={() => layout.showWidget(widget.id)}
                    className="h-9 rounded-xl border border-white/10 bg-white/[0.04] text-zinc-100"
                  >
                    <Eye className="size-4" aria-hidden="true" />
                    {DASHBOARD_WIDGET_COPY[widget.kind].title}
                  </Button>
                ))
              ) : (
                <p className="text-sm text-zinc-500">All widgets are visible.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Themes</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="flex flex-wrap gap-2">
                {THEME_MODES.map((mode) => (
                  <Button
                    key={mode}
                    type="button"
                    variant={theme === mode ? "default" : "ghost"}
                    onClick={() => setTheme(mode)}
                    className={cn(
                      "h-9 rounded-xl px-3",
                      theme === mode
                        ? "bg-blue-500/85 text-white"
                        : "border border-white/10 bg-white/[0.04] text-zinc-100"
                    )}
                  >
                    {themeLabels[mode]}
                  </Button>
                ))}
              </div>
              <Field label="Accent Color">
                <div className="flex flex-wrap items-center gap-2">
                  {ACCENT_COLORS.map((color) => (
                    <button
                      key={`${color.name}-${color.value}`}
                      type="button"
                      onClick={() => setAccentColor(color.value)}
                      className={cn(
                        "size-8 rounded-full border border-white/15 transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30",
                        accentColor === color.value && "ring-2 ring-blue-300"
                      )}
                      style={{ backgroundColor: color.value }}
                      aria-label={color.name}
                    />
                  ))}
                  <Input
                    type="color"
                    value={normalizeColorInput(accentColor)}
                    onChange={(event) => setAccentColor(event.target.value)}
                    className="h-10 w-16 p-1"
                    aria-label="Custom accent color"
                  />
                </div>
              </Field>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Background</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Field label="Solid Color">
                <Input
                  type="color"
                  value={normalizeColorInput(preferences.background.color)}
                  onChange={(event) =>
                    updateBackground({ color: event.target.value, mode: "solid" })
                  }
                  className="h-10 w-20 p-1"
                />
              </Field>
              <Button
                type="button"
                variant="ghost"
                onClick={() => wallpaperInputRef.current?.click()}
                className="h-10 rounded-xl border border-white/10 bg-white/[0.04] text-zinc-100"
              >
                <Upload className="size-4" aria-hidden="true" />
                Upload Wallpaper
              </Button>
              <input
                ref={wallpaperInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={uploadWallpaper}
              />
              <Field label="Blur">
                <Input
                  type="range"
                  min={0}
                  max={24}
                  value={preferences.background.blur}
                  onChange={(event) =>
                    updateBackground({ blur: Number(event.target.value) })
                  }
                />
              </Field>
              <Field label="Transparency">
                <Input
                  type="range"
                  min={0}
                  max={85}
                  value={preferences.background.transparency}
                  onChange={(event) =>
                    updateBackground({ transparency: Number(event.target.value) })
                  }
                />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sidebar</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  updateSidebar({ collapsed: !preferences.sidebar.collapsed })
                }
                className="h-10 rounded-xl border border-white/10 bg-white/[0.04] text-zinc-100"
              >
                {preferences.sidebar.collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              </Button>
              <Field label="Sidebar Width">
                <Input
                  type="range"
                  min={176}
                  max={320}
                  value={preferences.sidebar.width}
                  onChange={(event) =>
                    updateSidebar({ width: Number(event.target.value) })
                  }
                />
              </Field>
              <div className="grid gap-2">
                {orderedNavigationItems.map((item) => (
                  <PreferenceRow
                    key={item.href}
                    label={item.title}
                    onMoveDown={() => moveSidebarItem(item.href, "down")}
                    onMoveUp={() => moveSidebarItem(item.href, "up")}
                    trailing={
                      <>
                        <IconButton
                          icon={
                            preferences.sidebar.hidden.includes(item.href)
                              ? EyeOff
                              : Eye
                          }
                          label="Toggle page visibility"
                          onClick={() => toggleSidebarHidden(item.href)}
                          disabled={item.href === "/"}
                        />
                        <IconButton
                          icon={
                            preferences.sidebar.pinned.includes(item.href)
                              ? PinOff
                              : Pin
                          }
                          label="Toggle page favorite"
                          onClick={() => toggleSidebarPinned(item.href)}
                        />
                      </>
                    }
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Navbar</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {preferences.navbar.order.map((controlId) => {
                const control = NAVBAR_CONTROLS.find((item) => item.id === controlId)

                if (!control) {
                  return null
                }

                return (
                  <PreferenceRow
                    key={control.id}
                    label={control.label}
                    onMoveDown={() => moveNavbarControl(control.id, "down")}
                    onMoveUp={() => moveNavbarControl(control.id, "up")}
                    trailing={
                      <IconButton
                        icon={
                          preferences.navbar.hidden.includes(control.id) ? EyeOff : Eye
                        }
                        label="Toggle navbar item"
                        onClick={() => toggleNavbarHidden(control.id)}
                      />
                    }
                  />
                )
              })}
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}

function PreferenceRow({
  label,
  onMoveDown,
  onMoveUp,
  trailing,
}: {
  label: string
  onMoveDown: () => void
  onMoveUp: () => void
  trailing: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] p-2">
      <span className="min-w-0 flex-1 truncate text-sm text-zinc-200">{label}</span>
      <IconButton icon={ArrowUp} label="Move up" onClick={onMoveUp} />
      <IconButton icon={ArrowDown} label="Move down" onClick={onMoveDown} />
      {trailing}
    </div>
  )
}

function IconButton({
  disabled,
  icon: Icon,
  label,
  onClick,
}: {
  disabled?: boolean
  icon: LucideIcon
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className="grid size-8 place-items-center rounded-lg text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-100 disabled:pointer-events-none disabled:opacity-30"
    >
      <Icon className="size-4" aria-hidden="true" />
    </button>
  )
}

function renderWidgetContent(
  widget: DashboardWidget,
  context: DashboardContext,
  customizeMode: boolean
) {
  if (widget.kind === "schedule") {
    return (
      <ScheduleWidget
        now={context.now}
        schedules={context.schedules}
        settings={widget.settings}
      />
    )
  }

  if (widget.kind === "assignments") {
    return (
      <AssignmentsWidget
        activeAssignments={context.activeAssignments}
        completedAssignments={context.completedAssignments}
        settings={widget.settings}
      />
    )
  }

  if (widget.kind === "notes") {
    return <NotesWidget notes={context.notes} settings={widget.settings} />
  }

  if (widget.kind === "timer") {
    return (
      <TimerWidget
        pause={context.pause}
        progress={context.progress}
        remainingSeconds={context.remainingSeconds}
        reset={context.reset}
        setMode={context.setMode}
        settings={widget.settings}
        start={context.start}
        state={context.state}
        totalSeconds={context.totalSeconds}
      />
    )
  }

  if (widget.kind === "calculator") {
    return <CalculatorWidget history={context.history} settings={widget.settings} />
  }

  if (widget.kind === "calendar") {
    return (
      <CalendarWidget
        assignments={context.assignments}
        events={context.events}
        now={context.now}
        schedules={context.schedules}
        settings={widget.settings}
      />
    )
  }

  if (widget.kind === "quick-actions") {
    return (
      <QuickActionsWidget
        actions={context.quickActions}
        customizeMode={customizeMode}
        moveQuickAction={context.moveQuickAction}
        startTimer={context.start}
      />
    )
  }

  return <StatWidget kind={widget.kind} context={context} />
}

function ScheduleWidget({
  now,
  schedules,
  settings,
}: {
  now: Date | null
  schedules: ScheduleItem[]
  settings: DashboardWidgetSettings
}) {
  if (!now) {
    return <MiniEmpty icon={CalendarClock} text="Loading schedule view." />
  }

  const view = settings.scheduleView ?? "today"
  const today = getWeekday(now)
  const tomorrowDate = new Date(now)
  tomorrowDate.setDate(now.getDate() + 1)
  const tomorrow = getWeekday(tomorrowDate)
  const items = schedules
    .filter((item) => {
      if (view === "today") {
        return item.day === today
      }

      if (view === "tomorrow") {
        return item.day === tomorrow
      }

      return true
    })
    .sort((a, b) => {
      const daySort = WEEKDAYS.indexOf(a.day) - WEEKDAYS.indexOf(b.day)
      return daySort || compareTimes(a.startTime, b.startTime)
    })

  if (items.length === 0) {
    return <MiniEmpty icon={CalendarClock} text="No classes match this view." />
  }

  return (
    <div className="space-y-3">
      {items.slice(0, 5).map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between gap-4 rounded-xl border border-blue-400/20 bg-blue-500/[0.06] p-3"
        >
          <div className="min-w-0">
            <p className="truncate font-medium text-zinc-100">{item.subject}</p>
            <p className="text-sm text-zinc-500">
              {[view === "week" ? item.day : "", item.room, item.instructor]
                .filter(Boolean)
                .join(" - ") || "No room or instructor"}
            </p>
          </div>
          <Badge tone="blue">
            {formatTime(item.startTime)} - {formatTime(item.endTime)}
          </Badge>
        </div>
      ))}
    </div>
  )
}

function AssignmentsWidget({
  activeAssignments,
  completedAssignments,
  settings,
}: {
  activeAssignments: Assignment[]
  completedAssignments: Assignment[]
  settings: DashboardWidgetSettings
}) {
  const view = settings.assignmentsView ?? "upcoming"
  const assignments =
    view === "completed"
      ? completedAssignments
      : activeAssignments.filter((assignment) =>
          view === "overdue" ? isPastDate(assignment.dueDate) : true
        )

  if (assignments.length === 0) {
    return <MiniEmpty icon={ClipboardList} text="No assignments match this view." />
  }

  return (
    <div className="space-y-3">
      {assignments.slice(0, 5).map((assignment) => {
        const overdue = assignment.status !== "Completed" && isPastDate(assignment.dueDate)

        return (
          <div
            key={assignment.id}
            className={cn(
              "rounded-xl border border-white/10 bg-white/[0.035] p-3",
              overdue && "border-red-400/25 bg-red-500/[0.06]"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-zinc-100">{assignment.title}</p>
                <p className="mt-1 text-sm text-zinc-500">
                  {assignment.subject || "No subject"}
                </p>
              </div>
              <Badge tone={assignment.status === "Completed" ? "green" : overdue ? "red" : "yellow"}>
                {assignment.status === "Completed"
                  ? "Completed"
                  : overdue
                    ? "Overdue"
                    : formatDateLabel(assignment.dueDate)}
              </Badge>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function NotesWidget({
  notes,
  settings,
}: {
  notes: ReturnType<typeof useNotes>["notes"]
  settings: DashboardWidgetSettings
}) {
  const view = settings.notesView ?? "recent"
  const visibleNotes = notes
    .filter((note) => (view === "favorites" ? note.favorite : true))
    .slice()
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 5)

  if (visibleNotes.length === 0) {
    return <MiniEmpty icon={NotebookPen} text="No notes match this view." />
  }

  return (
    <div className="space-y-3">
      {visibleNotes.map((note) => (
        <div
          key={note.id}
          className="rounded-xl border border-white/10 bg-white/[0.035] p-3"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="truncate font-medium text-zinc-100">{note.title}</p>
            <Badge tone={note.pinned || note.favorite ? "blue" : "zinc"}>
              {note.category}
            </Badge>
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500">
            {note.content || "No content yet."}
          </p>
        </div>
      ))}
    </div>
  )
}

function TimerWidget({
  pause,
  progress,
  remainingSeconds,
  reset,
  setMode,
  settings,
  start,
  state,
}: {
  pause: () => void
  progress: number
  remainingSeconds: number
  reset: () => void
  setMode: ReturnType<typeof usePomodoro>["setMode"]
  settings: DashboardWidgetSettings
  start: () => void
  state: ReturnType<typeof usePomodoro>["state"]
  totalSeconds: number
}) {
  const full = (settings.timerView ?? "compact") === "full"

  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-5 text-center">
      <p className="text-5xl font-semibold tracking-normal text-blue-100">
        {formatSeconds(remainingSeconds)}
      </p>
      <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
        {state.isRunning ? "Running" : "Paused"} - {state.sessionCount} sessions
      </p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-blue-400 transition-all"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
      {full ? (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {(["focus", "short-break", "long-break"] as const).map((mode) => (
            <Button
              key={mode}
              type="button"
              variant={state.mode === mode ? "default" : "ghost"}
              onClick={() => setMode(mode)}
              className={cn(
                "h-9 rounded-xl",
                state.mode === mode
                  ? "bg-blue-500/85 text-white"
                  : "border border-white/10 bg-white/[0.04] text-zinc-100"
              )}
            >
              {pomodoroModeLabels[mode]}
            </Button>
          ))}
        </div>
      ) : null}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button
          type="button"
          onClick={state.isRunning ? pause : start}
          className="h-10 rounded-xl bg-blue-500/85 text-white hover:bg-blue-400"
        >
          {state.isRunning ? "Pause" : "Start"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={reset}
          className="h-10 rounded-xl border border-white/10 bg-white/[0.04] text-zinc-100"
        >
          Reset
        </Button>
      </div>
    </div>
  )
}

function CalculatorWidget({
  history,
  settings,
}: {
  history: ReturnType<typeof useCalculatorHistory>["history"]
  settings: DashboardWidgetSettings
}) {
  const expanded = (settings.calculatorView ?? "compact") === "expanded"
  const latestCalculation = history[0]

  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-black/25 p-4">
      <div className="rounded-xl border border-blue-400/20 bg-[#060913] p-4 text-right shadow-inner shadow-black">
        <p className="text-sm text-zinc-500">
          {latestCalculation?.expression || "No expression"}
        </p>
        <p className="mt-2 break-all text-3xl font-semibold text-blue-100">
          {latestCalculation?.result || "0"}
        </p>
      </div>
      {expanded ? (
        <div className="space-y-2">
          {history.slice(0, 4).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.04] px-3 py-2 text-sm"
            >
              <span className="min-w-0 truncate text-zinc-400">{item.expression}</span>
              <span className="font-medium text-zinc-100">{item.result}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function CalendarWidget({
  assignments,
  events,
  now,
  schedules,
  settings,
}: {
  assignments: Assignment[]
  events: CalendarEvent[]
  now: Date | null
  schedules: ScheduleItem[]
  settings: DashboardWidgetSettings
}) {
  if (!now) {
    return <MiniEmpty icon={CalendarDays} text="Loading calendar view." />
  }

  const items = getCalendarPreviewItems({
    assignments,
    events,
    now,
    schedules,
    view: settings.calendarView ?? "day",
  })

  if (items.length === 0) {
    return <MiniEmpty icon={CalendarDays} text="Nothing appears in this view." />
  }

  return (
    <div className="space-y-3">
      {items.slice(0, 6).map((item) => (
        <div
          key={item.id}
          className="rounded-xl border border-white/10 bg-white/[0.035] p-3"
        >
          <div className="flex items-center gap-2">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
              aria-hidden="true"
            />
            <p className="truncate font-medium text-zinc-100">{item.title}</p>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            {item.category} - {item.dateLabel}
            {item.startTime ? ` - ${formatTime(item.startTime)}` : ""}
          </p>
        </div>
      ))}
    </div>
  )
}

function QuickActionsWidget({
  actions,
  customizeMode,
  moveQuickAction,
  startTimer,
}: {
  actions: QuickActionId[]
  customizeMode: boolean
  moveQuickAction: (draggedId: QuickActionId, targetId: QuickActionId) => void
  startTimer: () => void
}) {
  const orderedActions = actions
    .map((actionId) => QUICK_ACTIONS.find((action) => action.id === actionId))
    .filter((action): action is (typeof QUICK_ACTIONS)[number] => Boolean(action))

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {orderedActions.map((action) => (
        <QuickActionButton
          key={action.id}
          action={action}
          customizeMode={customizeMode}
          moveQuickAction={moveQuickAction}
          startTimer={startTimer}
        />
      ))}
    </div>
  )
}

function QuickActionButton({
  action,
  customizeMode,
  moveQuickAction,
  startTimer,
}: {
  action: (typeof QUICK_ACTIONS)[number]
  customizeMode: boolean
  moveQuickAction: (draggedId: QuickActionId, targetId: QuickActionId) => void
  startTimer: () => void
}) {
  const { handleProps, isDragging } = useDraggable({
    disabled: !customizeMode,
    id: action.id,
    onMove: (draggedId, targetId) =>
      moveQuickAction(draggedId as QuickActionId, targetId as QuickActionId),
    targetSelector: "[data-quick-action]",
  })
  const content = (
    <>
      {customizeMode ? <GripVertical className="size-4" aria-hidden="true" /> : null}
      <span className="truncate">{action.label}</span>
    </>
  )
  const className = cn(
    "flex h-11 items-center justify-center gap-2 rounded-xl border border-blue-400/20 bg-blue-500/10 px-3 text-sm font-medium text-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-500/15",
    isDragging && "scale-95 opacity-70"
  )

  if (action.id === "start-timer") {
    return (
      <button
        type="button"
        data-quick-action
        data-drag-id={action.id}
        {...handleProps}
        onClick={startTimer}
        className={className}
      >
        {content}
      </button>
    )
  }

  return (
    <Link
      data-quick-action
      data-drag-id={action.id}
      {...handleProps}
      href={action.href}
      className={className}
    >
      {content}
    </Link>
  )
}

function StatWidget({
  context,
  kind,
}: {
  context: DashboardContext
  kind: DashboardWidgetKind
}) {
  const stat = getStat(kind, context)

  return (
    <div>
      <p className="break-words text-3xl font-semibold text-zinc-50">{stat.value}</p>
      {stat.detail ? <p className="mt-2 text-sm text-zinc-500">{stat.detail}</p> : null}
    </div>
  )
}

function MiniEmpty({ icon, text }: { icon: LucideIcon; text: string }) {
  const Icon = icon

  return (
    <EmptyState
      icon={Icon}
      title="Empty"
      description={text}
      className="min-h-32 border-white/10 bg-black/15 p-4"
    />
  )
}

function getStat(kind: DashboardWidgetKind, context: DashboardContext) {
  if (kind === "current-date") {
    return {
      value: context.now
        ? context.now.toLocaleDateString(undefined, {
            day: "numeric",
            month: "long",
            weekday: "long",
            year: "numeric",
          })
        : "Loading date",
    }
  }

  if (kind === "current-time") {
    return {
      value: context.now
        ? context.now.toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
          })
        : "Loading time",
    }
  }

  if (kind === "total-assignments") {
    return { value: context.assignments.length }
  }

  if (kind === "completed-assignments") {
    return { value: context.completedAssignments.length }
  }

  if (kind === "remaining-assignments") {
    return { value: context.activeAssignments.length }
  }

  if (kind === "classes-today") {
    if (!context.now) {
      return { value: "Loading" }
    }

    const today = getWeekday(context.now)
    return {
      value: context.schedules.filter((item) => item.day === today).length,
    }
  }

  return {
    detail: "Due in the next 7 days",
    value: context.upcomingDeadlines.length,
  }
}

function getCalendarPreviewItems({
  assignments,
  events,
  now,
  schedules,
  view,
}: {
  assignments: Assignment[]
  events: CalendarEvent[]
  now: Date
  schedules: ScheduleItem[]
  view: NonNullable<DashboardWidgetSettings["calendarView"]>
}) {
  if (view === "day") {
    return getAgendaForDate({ assignments, date: now, events, schedules }).map((item) => ({
      category: item.category,
      color: item.color,
      dateLabel: "Today",
      id: item.id,
      startTime: item.startTime,
      title: item.title,
    }))
  }

  if (view === "week") {
    return Array.from({ length: 7 }).flatMap((_, index) => {
      const date = new Date(now)
      date.setDate(now.getDate() + index)

      return getAgendaForDate({ assignments, date, events, schedules }).map((item) => ({
        category: item.category,
        color: item.color,
        dateLabel: date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        id: `${date.toISOString()}-${item.id}`,
        startTime: item.startTime,
        title: item.title,
      }))
    })
  }

  return [
    ...events
      .filter((event) => isSameMonth(event.date, now))
      .map((event) => ({
        category: event.category,
        color: event.color,
        dateLabel: formatDateLabel(event.date),
        id: `event-${event.id}`,
        startTime: event.startTime,
        title: event.title,
      })),
    ...assignments
      .filter((assignment) => assignment.dueDate && isSameMonth(assignment.dueDate, now))
      .map((assignment) => ({
        category: "Assignment",
        color: isPastDate(assignment.dueDate) ? "#f87171" : "#facc15",
        dateLabel: formatDateLabel(assignment.dueDate),
        id: `assignment-${assignment.id}`,
        startTime: "",
        title: assignment.title,
      })),
  ].sort((a, b) => a.dateLabel.localeCompare(b.dateLabel))
}

function useDashboardColumns() {
  const [columns, setColumns] = useState(12)

  useEffect(() => {
    function updateColumns() {
      if (window.innerWidth < 640) {
        setColumns(1)
        return
      }

      if (window.innerWidth < 1280) {
        setColumns(6)
        return
      }

      setColumns(12)
    }

    updateColumns()
    window.addEventListener("resize", updateColumns)

    return () => window.removeEventListener("resize", updateColumns)
  }, [])

  return columns
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ""))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function normalizeColorInput(color: string) {
  return /^#[0-9a-f]{6}$/i.test(color) ? color : "#3b82f6"
}

function isSameMonth(dateKey: string, date: Date) {
  const parsed = new Date(`${dateKey}T00:00:00`)

  return parsed.getFullYear() === date.getFullYear() && parsed.getMonth() === date.getMonth()
}

function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}
