"use client"

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
} from "react"
import { Popover } from "@base-ui/react/popover"
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
  Sparkles,
  TimerReset,
  Upload,
  X,
  type LucideIcon,
} from "lucide-react"

import { DashboardCard } from "@/components/dashboard/dashboard-card"
import { navigationItems } from "@/components/navigation"
import { useSharedPomodoro } from "@/components/providers/pomodoro-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { HubPopoverContent } from "@/components/ui/hub-popover-content"
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
import { useGridReflow } from "@/hooks/use-grid-reflow"
import { useNotes } from "@/hooks/use-notes"
import { pomodoroModeLabels } from "@/hooks/use-pomodoro"
import { useResizable, type ResizeDirection } from "@/hooks/use-resizable"
import { useSchedule } from "@/hooks/use-schedule"
import { useTheme } from "@/hooks/use-theme"
import { useWidgetSettings } from "@/hooks/use-widget-settings"
import {
  DASHBOARD_WIDGET_DEFINITIONS,
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

const widgetSettingsPopover = Popover.createHandle<string>()

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
  quickActions: QuickActionId[]
  schedules: ScheduleItem[]
  upcomingDeadlines: Assignment[]
}

export function DashboardPage() {
  const dashboardLayout = useDashboardLayout()
  const { assignments } = useAssignments()
  const { history } = useCalculatorHistory()
  const { events } = useCalendarEvents()
  const { notes } = useNotes()
  const { schedules } = useSchedule()
  const [now, setNow] = useState<Date | null>(null)
  const [maximizedWidgetId, setMaximizedWidgetId] = useState<string | null>(null)
  const maximizedCloseButtonRef = useRef<HTMLButtonElement | null>(null)
  const [dashboardGridElement, setDashboardGridElement] = useState<HTMLElement | null>(null)
  const gridColumns = useDashboardColumns()
  const gridLayoutKey = dashboardLayout.visibleWidgets
    .map(
      (widget) =>
        `${widget.id}:${widget.colSpan}:${widget.rowSpan}:${widget.pinned ? "pinned" : "free"}`
    )
    .join("|")

  useGridReflow(dashboardGridElement, `${gridColumns}:${gridLayoutKey}`)

  useEffect(() => {
    const tick = () => setNow(new Date())
    const timeout = window.setTimeout(tick, 0)
    const interval = window.setInterval(tick, 60_000)

    return () => {
      window.clearTimeout(timeout)
      window.clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (!maximizedWidgetId) {
      return
    }

    const previousOverflow = document.body.style.overflow
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    const focusFrame = window.requestAnimationFrame(() => {
      maximizedCloseButtonRef.current?.focus()
    })

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMaximizedWidgetId(null)
      }
    }

    document.body.style.overflow = "hidden"
    document.addEventListener("keydown", closeOnEscape)

    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", closeOnEscape)
      previousFocus?.focus()
    }
  }, [maximizedWidgetId])

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
    quickActions: dashboardLayout.activePreset.quickActions,
    schedules,
    upcomingDeadlines,
  }
  return (
    <PageContent>
      <section className="hub-glass-strong mb-5 overflow-hidden rounded-[2rem] p-5 sm:p-6">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[var(--hub-accent)] to-transparent opacity-80" />
        <div className="relative grid gap-5 xl:grid-cols-[1fr_22rem] xl:items-end">
          <div className="min-w-0">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--hub-accent-border)] bg-[var(--hub-accent-soft)] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[var(--hub-accent)]">
              <Sparkles className="size-3.5" aria-hidden="true" />
              Student Command Center
            </div>
            <h1 className="break-words text-3xl font-semibold tracking-normal text-[var(--hub-text)] sm:text-4xl lg:text-5xl">
              {getDashboardGreeting(now)}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--hub-muted-text)] sm:text-base">
              Your classes, deadlines, notes, timer, and AI workspace are arranged as
              customizable glass widgets.
            </p>
          </div>
          <div className="grid gap-3">
            <Button
              type="button"
              onClick={() => dashboardLayout.setCustomizeMode(!dashboardLayout.customizeMode)}
              className={cn(
                "h-12 rounded-2xl px-4",
                dashboardLayout.customizeMode && "bg-emerald-500 text-white hover:bg-emerald-400"
              )}
            >
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              {dashboardLayout.customizeMode ? "Done Customizing" : "Customize Dashboard"}
            </Button>
            <Link
              href="/ai"
              className="hub-glass-control hub-focus flex h-12 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-medium text-[var(--hub-text)] transition-[color,background-color,border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-[var(--hub-accent-border)] hover:text-[var(--hub-accent)]"
            >
              <Sparkles className="size-4" aria-hidden="true" />
              Open AI Hub
            </Link>
          </div>
        </div>
      </section>

      {dashboardLayout.customizeMode ? (
        <DashboardCustomizePanel layout={dashboardLayout} />
      ) : null}

      <section
        ref={setDashboardGridElement}
        data-dashboard-grid
        className="grid items-start gap-4"
        style={{
          gridAutoFlow: "row dense",
          gridAutoRows: "minmax(80px, auto)",
          gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
        }}
      >
        {dashboardLayout.visibleWidgets.map((widget) => (
          <DashboardWidgetShell
            key={widget.id}
            columns={gridColumns}
            customizeMode={dashboardLayout.customizeMode}
            moveWidget={dashboardLayout.moveWidget}
            resizeWidget={dashboardLayout.resizeWidget}
            widget={widget}
          >
            {renderWidgetContent(widget, context, dashboardLayout.customizeMode)}
          </DashboardWidgetShell>
        ))}
      </section>

      <DashboardWidgetSettingsPopover
        duplicateWidget={dashboardLayout.duplicateWidget}
        hideWidget={dashboardLayout.hideWidget}
        onMaximize={setMaximizedWidgetId}
        setWidgetSize={dashboardLayout.setWidgetSize}
        togglePinWidget={dashboardLayout.togglePinWidget}
        updateWidgetSettings={dashboardLayout.updateWidgetSettings}
        widgets={dashboardLayout.activePreset.widgets}
      />

      {maximizedWidget ? (
        <div
          role="dialog"
          aria-label={`${DASHBOARD_WIDGET_DEFINITIONS[maximizedWidget.kind].title} maximized widget`}
          aria-modal="true"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setMaximizedWidgetId(null)
            }
          }}
          className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-4 backdrop-blur"
        >
          <div className="w-full max-w-5xl">
            <DashboardCard
              title={DASHBOARD_WIDGET_DEFINITIONS[maximizedWidget.kind].title}
              description={
                DASHBOARD_WIDGET_DEFINITIONS[maximizedWidget.kind].description
              }
              emphasis={DASHBOARD_WIDGET_DEFINITIONS[maximizedWidget.kind].emphasis}
              icon={widgetIcons[maximizedWidget.kind]}
              actions={
                <Button
                  ref={maximizedCloseButtonRef}
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
  return <div className="mx-auto w-full max-w-[92rem] px-3 py-5 sm:px-5 lg:px-7 xl:px-8">{children}</div>
}

function DashboardWidgetShell({
  children,
  columns,
  customizeMode,
  moveWidget,
  resizeWidget,
  widget,
}: {
  children: React.ReactNode
  columns: number
  customizeMode: boolean
  moveWidget: (draggedId: string, targetId: string) => void
  resizeWidget: (widgetId: string, colSpan: number, rowSpan: number) => void
  widget: DashboardWidget
}) {
  const span = Math.max(1, Math.min(widget.colSpan, columns))
  const Icon = widgetIcons[widget.kind]
  const definition = DASHBOARD_WIDGET_DEFINITIONS[widget.kind]
  const constraints = definition.constraints
  const {
    handleProps: dragHandleProps,
    isDragPending,
    isDragging,
  } = useDraggable({
    boundarySelector: "[data-dashboard-grid]",
    id: widget.id,
    onDragStart: () => widgetSettingsPopover.close(),
    onMove: moveWidget,
    targetSelector: "[data-dashboard-widget]",
    topBoundarySelector: "[data-app-navbar]",
  })
  const { getHandleProps: getResizeHandleProps, isResizing } = useResizable({
    colSpan: widget.colSpan,
    maxColSpan: Math.min(columns, constraints.maxColSpan),
    maxRowSpan: constraints.maxRowSpan,
    minColSpan: Math.min(columns, constraints.minColSpan),
    minRowSpan: constraints.minRowSpan,
    onResize: (colSpan, rowSpan) => resizeWidget(widget.id, colSpan, rowSpan),
    onResizeStart: () => widgetSettingsPopover.close(),
  })
  const widgetHeight = Math.max(160, widget.rowSpan * 80)
  const widgetStyle: CSSProperties = {
    gridColumn: `span ${span} / span ${span}`,
    ...(widget.size === "custom"
      ? { height: widgetHeight }
      : { minHeight: widgetHeight }),
  }

  return (
    <div
      data-dashboard-widget
      data-drag-id={widget.id}
      data-drag-state={isDragging ? "active" : isDragPending ? "pending" : "idle"}
      data-resize-state={isResizing ? "active" : "idle"}
      className={cn(
        "relative min-w-0",
        isResizing
          ? "transition-opacity duration-150 ease-out"
          : "transition-[height,min-height,opacity] duration-200 ease-out",
        isDragging && "opacity-25",
        isResizing && "hub-accent-ring",
        widget.pinned && "order-first"
      )}
      style={widgetStyle}
    >
      <DashboardCard
        title={definition.title}
        description={definition.description}
        emphasis={definition.emphasis}
        icon={Icon}
        actions={
          <div data-no-drag className="flex shrink-0 cursor-default items-center gap-1.5">
            {widget.pinned ? (
              <Pin
                className="size-4 fill-[var(--hub-accent)] text-[var(--hub-accent)]"
                aria-hidden="true"
              />
            ) : null}
            <button
              type="button"
              data-drag-allow
              aria-label={`Drag ${definition.title} widget`}
              title="Drag widget"
              className={cn(
                "grid size-9 cursor-grab place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-400 opacity-70 transition-[color,background-color,border-color,opacity,transform] duration-200 ease-out hover:bg-white/[0.07] hover:text-zinc-100 hover:opacity-100 active:cursor-grabbing",
                isDragPending && "hub-accent-ring text-[var(--hub-accent)] opacity-100",
                isDragging && "cursor-grabbing text-[var(--hub-accent)] opacity-100"
              )}
            >
              <GripVertical className="size-4" aria-hidden="true" />
            </button>
            <Popover.Trigger
              handle={widgetSettingsPopover}
              payload={widget.id}
              data-no-drag
              aria-label={`${definition.title} widget settings`}
              title="Widget settings"
              className="hub-focus grid size-9 place-items-center rounded-xl text-zinc-400 transition-[color,background-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:bg-white/[0.06] hover:text-zinc-100"
            >
              <Settings className="size-4" aria-hidden="true" />
            </Popover.Trigger>
          </div>
        }
        className={cn(
          "flex min-h-full flex-col overflow-hidden",
          customizeMode && "ring-1 ring-[var(--hub-accent-border)]",
          isDragPending && "border-[var(--hub-accent-border)] shadow-2xl shadow-[var(--hub-accent-glow)]",
          isDragging && "border-[var(--hub-accent-border)] shadow-2xl shadow-[var(--hub-accent-glow)]"
        )}
        contentClassName="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        headerProps={
          {
            ...dragHandleProps,
            "data-drag-handle": "true",
            className: cn(
              "relative shrink-0 cursor-grab select-none rounded-t-2xl transition-colors duration-200 ease-out active:cursor-grabbing",
              isDragPending && "bg-[var(--hub-accent-soft)]",
              isDragging && "cursor-grabbing bg-[var(--hub-accent-soft)]"
            ),
          }
        }
      >
        {children}
      </DashboardCard>
      <WidgetResizeZones getHandleProps={getResizeHandleProps} />
    </div>
  )
}

const resizeZones: Array<{
  className: string
  direction: ResizeDirection
}> = [
  { direction: "n", className: "left-3 right-3 top-0 h-2" },
  { direction: "s", className: "bottom-0 left-3 right-3 h-2" },
  { direction: "e", className: "bottom-3 right-0 top-3 w-2" },
  { direction: "w", className: "bottom-3 left-0 top-3 w-2" },
  { direction: "nw", className: "left-0 top-0 size-2.5" },
  { direction: "ne", className: "right-0 top-0 size-2.5" },
  { direction: "sw", className: "bottom-0 left-0 size-2.5" },
  { direction: "se", className: "bottom-0 right-0 size-2.5" },
]

function WidgetResizeZones({
  getHandleProps,
}: {
  getHandleProps: ReturnType<typeof useResizable>["getHandleProps"]
}) {
  return (
    <>
      {resizeZones.map((zone) => (
        <div
          key={zone.direction}
          {...getHandleProps(zone.direction)}
          data-resize-handle
          className={cn(
            "hub-widget-resize-zone absolute z-20",
            zone.className
          )}
        />
      ))}
    </>
  )
}

function DashboardWidgetSettingsPopover({
  duplicateWidget,
  hideWidget,
  onMaximize,
  setWidgetSize,
  togglePinWidget,
  updateWidgetSettings,
  widgets,
}: {
  duplicateWidget: (widgetId: string) => void
  hideWidget: (widgetId: string) => void
  onMaximize: (widgetId: string) => void
  setWidgetSize: (widgetId: string, size: DashboardWidgetSize) => void
  togglePinWidget: (widgetId: string) => void
  updateWidgetSettings: (
    widgetId: string,
    settings: DashboardWidgetSettings
  ) => void
  widgets: DashboardWidget[]
}) {
  return (
    <Popover.Root handle={widgetSettingsPopover}>
      {({ payload }) => {
        const widget = widgets.find((item) => item.id === payload)

        if (!widget) {
          return null
        }

        return (
          <HubPopoverContent
            align="start"
            positionerClassName="z-[80]"
            popupProps={{
              "data-no-drag": true,
              "data-widget-settings-popup": widget.id,
              className:
                "max-h-[min(34rem,calc(100dvh-1.5rem))] w-[min(19rem,calc(100vw-1.5rem))] overflow-y-auto overscroll-contain p-4",
            }}
          >
            <DashboardWidgetSettingsContent
              duplicateWidget={duplicateWidget}
              hideWidget={hideWidget}
              onMaximize={onMaximize}
              setWidgetSize={setWidgetSize}
              togglePinWidget={togglePinWidget}
              updateWidgetSettings={updateWidgetSettings}
              widget={widget}
            />
          </HubPopoverContent>
        )
      }}
    </Popover.Root>
  )
}

function DashboardWidgetSettingsContent({
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
  onMaximize: (widgetId: string) => void
  setWidgetSize: (widgetId: string, size: DashboardWidgetSize) => void
  togglePinWidget: (widgetId: string) => void
  updateWidgetSettings: (
    widgetId: string,
    settings: DashboardWidgetSettings
  ) => void
  widget: DashboardWidget
}) {
  const { setSize, updateSettings } = useWidgetSettings({
    setWidgetSize,
    updateWidgetSettings,
    widget,
  })

  function runAndClose(action: () => void) {
    widgetSettingsPopover.close()
    action()
  }

  return (
    <div className="grid gap-3">
      <div className="flex min-w-0 items-start justify-between gap-3 border-b border-white/10 pb-3">
        <div className="grid min-w-0 gap-1">
          <Popover.Title className="text-sm font-semibold text-[var(--hub-text)]">
            Widget settings
          </Popover.Title>
          <p className="truncate text-xs leading-4 text-[var(--hub-muted-text)]">
            {DASHBOARD_WIDGET_DEFINITIONS[widget.kind].title}
          </p>
        </div>
        <Popover.Close
          aria-label="Close widget settings"
          className="hub-focus grid size-8 shrink-0 place-items-center rounded-lg text-zinc-400 transition-colors duration-150 hover:bg-white/[0.08] hover:text-zinc-100"
        >
          <X className="size-4" aria-hidden="true" />
        </Popover.Close>
      </div>

      <Field label="Widget Size">
        <div className="grid grid-cols-4 gap-1.5">
          {(["small", "medium", "large", "custom"] as DashboardWidgetSize[]).map((size) => (
            <Button
              key={size}
              type="button"
              variant={widget.size === size ? "default" : "ghost"}
              onClick={() => setSize(size)}
              className={cn(
                "h-9 min-w-0 rounded-xl px-1.5 text-xs capitalize",
                widget.size === size
                  ? "hub-accent-bg"
                  : "hub-glass-control text-zinc-200"
              )}
            >
              {size}
            </Button>
          ))}
        </div>
        {widget.size === "custom" ? (
          <p className="text-xs leading-5 text-[var(--hub-muted-text)]">
            Custom: {widget.colSpan} columns by {widget.rowSpan * 80}px
          </p>
        ) : null}
      </Field>

      <WidgetSettingControl widget={widget} updateSettings={updateSettings} />

      <div className="grid gap-1.5 border-t border-white/10 pt-3">
        <MenuButton
          icon={Maximize2}
          label="Maximize"
          onClick={() => runAndClose(() => onMaximize(widget.id))}
        />
        <MenuButton
          icon={widget.pinned ? PinOff : Pin}
          label={widget.pinned ? "Unpin Widget" : "Pin Widget"}
          onClick={() => runAndClose(() => togglePinWidget(widget.id))}
        />
        {DASHBOARD_WIDGET_DEFINITIONS[widget.kind].duplicable ? (
          <MenuButton
            icon={Copy}
            label="Duplicate Widget"
            onClick={() => runAndClose(() => duplicateWidget(widget.id))}
          />
        ) : null}
        <MenuButton
          icon={EyeOff}
          label="Hide Widget"
          onClick={() => runAndClose(() => hideWidget(widget.id))}
        />
      </div>
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
  const setting = DASHBOARD_WIDGET_DEFINITIONS[widget.kind].setting

  if (!setting) {
    return null
  }

  const value =
    (widget.settings[setting.key] as string | undefined) ?? setting.defaultValue

  return (
    <Field label={setting.label}>
      <Select
        value={value}
        onChange={(event) =>
          updateSettings({
            [setting.key]: event.target.value,
          } as DashboardWidgetSettings)
        }
      >
        {setting.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
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
      className="hub-focus flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-left text-zinc-300 transition-[color,background-color,transform] duration-150 ease-out hover:translate-x-0.5 hover:bg-white/[0.07] hover:text-zinc-100"
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
  const [customAccentDraft, setCustomAccentDraft] = useState({
    source: accentColor,
    value: accentColor,
  })
  const customAccent =
    customAccentDraft.source === accentColor ? customAccentDraft.value : accentColor
  const orderedNavigationItems = useMemo(() => {
    const byHref = new Map(navigationItems.map((item) => [item.href, item]))

    return preferences.sidebar.order
      .map((href) => byHref.get(href))
      .filter((item): item is (typeof navigationItems)[number] => Boolean(item))
  }, [preferences.sidebar.order])

  const layoutName =
    layoutNameDrafts[layout.activePreset.id] ?? layout.activePreset.name

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
                className="h-10 rounded-xl px-3"
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
                className="h-10 rounded-xl px-3"
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
                    {DASHBOARD_WIDGET_DEFINITIONS[widget.kind].title}
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
                        ? "hub-accent-bg"
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
                      onClick={() => applyAccentColor(color.value)}
                      className={cn(
                        "size-8 rounded-full border border-white/15 transition-[border-color,box-shadow,transform] duration-200 ease-out hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hub-accent-ring)]",
                        accentColor === color.value && "hub-accent-ring"
                      )}
                      style={{ backgroundColor: color.value }}
                      aria-label={color.name}
                    />
                  ))}
                  <Input
                    type="color"
                    value={normalizeColorInput(customAccent, accentColor)}
                    onChange={(event) => applyAccentColor(event.target.value)}
                    className="h-10 w-16 p-1"
                    aria-label="Custom accent color"
                  />
                  <Input
                    value={customAccent}
                    onChange={(event) => applyAccentColor(event.target.value)}
                    placeholder="#8B5CF6"
                    aria-label="Custom accent HEX value"
                    aria-invalid={customAccent.length > 0 && !isValidHexColor(customAccent)}
                    className={cn(
                      "h-10 w-32 font-mono uppercase",
                      customAccent.length > 0 &&
                        !isValidHexColor(customAccent) &&
                        "border-red-400/50 focus-visible:border-red-400/60 focus-visible:ring-red-500/20"
                    )}
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
      <span className="min-w-0 flex-1 break-words text-sm text-zinc-200">{label}</span>
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
      className="grid size-8 place-items-center rounded-lg text-zinc-400 transition-[color,background-color,opacity] duration-150 ease-out hover:bg-white/[0.06] hover:text-zinc-100 disabled:pointer-events-none disabled:opacity-30"
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
        limit={getWidgetItemLimit(widget)}
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
        limit={getWidgetItemLimit(widget)}
        settings={widget.settings}
      />
    )
  }

  if (widget.kind === "notes") {
    return (
      <NotesWidget
        limit={getWidgetItemLimit(widget)}
        notes={context.notes}
        settings={widget.settings}
      />
    )
  }

  if (widget.kind === "timer") {
    return <TimerWidget settings={widget.settings} />
  }

  if (widget.kind === "calculator") {
    return <CalculatorWidget history={context.history} settings={widget.settings} />
  }

  if (widget.kind === "calendar") {
    return (
      <CalendarWidget
        assignments={context.assignments}
        events={context.events}
        limit={getWidgetItemLimit(widget)}
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
      />
    )
  }

  if (widget.kind === "current-time") {
    return <CurrentTimeWidget />
  }

  if (widget.kind === "upcoming-deadlines") {
    return (
      <DeadlinesWidget
        assignments={context.upcomingDeadlines}
        limit={getWidgetItemLimit(widget)}
      />
    )
  }

  if (widget.kind === "classes-today") {
    return (
      <ClassesTodayWidget
        limit={getWidgetItemLimit(widget)}
        now={context.now}
        schedules={context.schedules}
      />
    )
  }

  return <StatWidget kind={widget.kind} context={context} />
}

function ScheduleWidget({
  limit,
  now,
  schedules,
  settings,
}: {
  limit: number
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
    <div className="grid gap-3">
      {items.slice(0, limit).map((item) => (
        <div
          key={item.id}
          className="hub-glass-control relative overflow-hidden rounded-2xl p-3 pl-7 sm:grid sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-3 sm:p-3"
        >
          <span className="absolute bottom-3 left-4 top-3 w-px bg-gradient-to-b from-[var(--hub-accent)] via-[var(--hub-accent-border)] to-transparent sm:hidden" />
          <span className="hidden size-3 rounded-full bg-[var(--hub-accent)] shadow-[0_0_18px_var(--hub-accent)] sm:block" />
          <div className="grid min-w-0 gap-1">
            <p className="break-words font-medium text-zinc-100">{item.subject}</p>
            <p className="break-words text-sm leading-5 text-zinc-500">
              {[view === "week" ? item.day : "", item.room, item.instructor]
                .filter(Boolean)
                .join(" - ") || "No room or instructor"}
            </p>
          </div>
          <Badge tone="blue" className="w-fit">
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
  limit,
  settings,
}: {
  activeAssignments: Assignment[]
  completedAssignments: Assignment[]
  limit: number
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
    <div className="grid gap-3">
      {assignments.slice(0, limit).map((assignment) => {
        const overdue = assignment.status !== "Completed" && isPastDate(assignment.dueDate)

        return (
          <div
            key={assignment.id}
            className={cn(
              "hub-glass-control rounded-2xl p-3",
              overdue && "border-red-400/30 bg-red-500/[0.075]"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="grid min-w-0 gap-1">
                <p className="break-words font-medium text-zinc-100">{assignment.title}</p>
                <p className="break-words text-sm leading-5 text-zinc-500">
                  {assignment.subject || "No subject"}
                </p>
              </div>
              <Badge tone={assignment.status === "Completed" ? "green" : overdue ? "red" : assignment.priority === "High" ? "yellow" : "blue"}>
                {assignment.status === "Completed"
                  ? "Completed"
                  : overdue
                    ? "Overdue"
                    : formatDateLabel(assignment.dueDate)}
              </Badge>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-200 ease-out",
                  assignment.status === "Completed"
                    ? "bg-emerald-400"
                    : overdue
                      ? "bg-red-400"
                      : "bg-[var(--hub-accent)]"
                )}
                style={{ width: `${assignment.progress}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function NotesWidget({
  limit,
  notes,
  settings,
}: {
  limit: number
  notes: ReturnType<typeof useNotes>["notes"]
  settings: DashboardWidgetSettings
}) {
  const view = settings.notesView ?? "recent"
  const visibleNotes = notes
    .filter((note) => (view === "favorites" ? note.favorite : true))
    .slice()
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, limit)

  if (visibleNotes.length === 0) {
    return <MiniEmpty icon={NotebookPen} text="No notes match this view." />
  }

  return (
    <div className="grid gap-3">
      {visibleNotes.map((note) => (
        <div
          key={note.id}
          className="hub-glass-control rounded-2xl p-3"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="min-w-0 break-words font-medium leading-5 text-zinc-100">
              {note.title}
            </p>
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

function TimerWidget({ settings }: { settings: DashboardWidgetSettings }) {
  const {
    pause,
    progress,
    remainingSeconds,
    reset,
    setMode,
    start,
    state,
  } = useSharedPomodoro()
  const full = (settings.timerView ?? "compact") === "full"
  const circumference = 2 * Math.PI * 54
  const progressOffset = circumference * (1 - progress)

  return (
    <div className="hub-glass-control rounded-[1.5rem] p-4 text-center sm:p-5">
      <div className="relative mx-auto grid size-40 place-items-center rounded-full border border-white/10 bg-black/20 shadow-inner shadow-black/40">
        <svg className="absolute size-36 -rotate-90" viewBox="0 0 132 132" aria-hidden="true">
          <circle
            cx="66"
            cy="66"
            r="54"
            className="stroke-white/10"
            fill="none"
            strokeWidth="10"
          />
          <circle
            cx="66"
            cy="66"
            r="54"
            className="stroke-[var(--hub-accent)] transition-[stroke-dashoffset] duration-200 ease-out"
            fill="none"
            strokeLinecap="round"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
          />
        </svg>
        <div className="relative grid gap-1">
          <p className="break-words text-3xl font-semibold tracking-normal text-[var(--hub-text)] sm:text-4xl">
            {formatSeconds(remainingSeconds)}
          </p>
          <p className="text-[0.65rem] font-medium uppercase leading-4 tracking-[0.18em] text-[var(--hub-muted-text)]">
            {pomodoroModeLabels[state.mode]}
          </p>
        </div>
      </div>
      <p className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-[var(--hub-muted-text)]">
        {state.isRunning ? "Running" : "Paused"} - {state.sessionCount} sessions
      </p>
      {full ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {(["focus", "short-break", "long-break"] as const).map((mode) => (
            <Button
              key={mode}
              type="button"
              variant={state.mode === mode ? "default" : "ghost"}
              onClick={() => setMode(mode)}
              className={cn(
                "h-9 rounded-xl",
                state.mode === mode
                  ? "hub-accent-bg"
                  : "hub-glass-control text-zinc-100"
              )}
            >
              {pomodoroModeLabels[mode]}
            </Button>
          ))}
        </div>
      ) : null}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Button
          type="button"
          onClick={state.isRunning ? pause : start}
          className="h-10 rounded-xl"
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
    <div className="hub-glass-control grid gap-3 rounded-2xl p-4">
      <div className="rounded-xl border border-[var(--hub-accent-border)] bg-black/25 p-4 text-right shadow-inner shadow-black/40">
        <p className="text-sm text-zinc-500">
          {latestCalculation?.expression || "No expression"}
        </p>
        <p className="mt-2 break-all text-2xl font-semibold text-[var(--hub-text)] sm:text-3xl">
          {latestCalculation?.result || "0"}
        </p>
      </div>
      {expanded ? (
        <div className="grid gap-2">
          {history.slice(0, 4).map((item) => (
            <div
              key={item.id}
              className="hub-glass-control flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm"
            >
              <span className="min-w-0 break-all text-zinc-400">{item.expression}</span>
              <span className="break-all font-medium text-zinc-100">{item.result}</span>
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
  limit,
  now,
  schedules,
  settings,
}: {
  assignments: Assignment[]
  events: CalendarEvent[]
  limit: number
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
    <div className="grid gap-3">
      {items.slice(0, limit).map((item) => (
        <div key={item.id} className="hub-glass-control grid gap-1.5 rounded-2xl p-3">
          <div className="flex items-start gap-2">
            <span
              className="mt-1 size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
              aria-hidden="true"
            />
            <p className="min-w-0 break-words font-medium text-zinc-100">{item.title}</p>
          </div>
          <p className="break-words text-sm leading-5 text-zinc-500">
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
}: {
  actions: QuickActionId[]
  customizeMode: boolean
  moveQuickAction: (draggedId: QuickActionId, targetId: QuickActionId) => void
}) {
  const { start: startTimer } = useSharedPomodoro()
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
      <span className="min-w-0 break-words leading-5">{action.label}</span>
    </>
  )
  const className = cn(
    "hub-glass-control flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 py-2 text-center text-sm font-medium text-[var(--hub-text)] transition-[color,background-color,border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-[var(--hub-accent-border)] hover:bg-[var(--hub-accent-soft)]",
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
      <p className="break-words text-2xl font-semibold text-zinc-50 sm:text-3xl">{stat.value}</p>
      {stat.detail ? <p className="mt-2 text-sm text-zinc-500">{stat.detail}</p> : null}
    </div>
  )
}

function CurrentTimeWidget() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    const tick = () => setNow(new Date())
    const timeout = window.setTimeout(tick, 0)
    const interval = window.setInterval(tick, 1000)

    return () => {
      window.clearTimeout(timeout)
      window.clearInterval(interval)
    }
  }, [])

  return (
    <div>
      <p className="break-words text-2xl font-semibold text-zinc-50 sm:text-3xl">
        {now
          ? now.toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "2-digit",
              second: "2-digit",
            })
          : "Loading time"}
      </p>
    </div>
  )
}

function DeadlinesWidget({
  assignments,
  limit,
}: {
  assignments: Assignment[]
  limit: number
}) {
  if (assignments.length === 0) {
    return <MiniEmpty icon={Clock} text="No active deadlines in the next seven days." />
  }

  return (
    <div>
      <div className="mb-3 flex items-end justify-between gap-3">
        <p className="text-3xl font-semibold text-zinc-50">{assignments.length}</p>
        <p className="pb-1 text-xs text-[var(--hub-muted-text)]">Due within 7 days</p>
      </div>
      <div className="grid gap-2">
        {assignments.slice(0, limit).map((assignment) => (
          <div
            key={assignment.id}
            className="hub-glass-control flex items-start justify-between gap-3 rounded-xl px-3 py-2.5"
          >
            <div className="grid min-w-0 gap-1">
              <p className="break-words text-sm font-medium text-zinc-100">
                {assignment.title}
              </p>
              <p className="break-words text-xs leading-4 text-[var(--hub-muted-text)]">
                {assignment.subject || "Assignment"}
              </p>
            </div>
            <span className="shrink-0 text-xs font-medium text-[var(--hub-accent)]">
              {formatDateLabel(assignment.dueDate, { year: undefined })}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ClassesTodayWidget({
  limit,
  now,
  schedules,
}: {
  limit: number
  now: Date | null
  schedules: ScheduleItem[]
}) {
  if (!now) {
    return <MiniEmpty icon={CalendarClock} text="Loading today's classes." />
  }

  const classes = schedules
    .filter((schedule) => schedule.day === getWeekday(now))
    .slice()
    .sort((a, b) => compareTimes(a.startTime, b.startTime))

  if (classes.length === 0) {
    return <MiniEmpty icon={CalendarClock} text="No classes scheduled today." />
  }

  return (
    <div>
      <div className="mb-3 flex items-end justify-between gap-3">
        <p className="text-3xl font-semibold text-zinc-50">{classes.length}</p>
        <p className="pb-1 text-xs text-[var(--hub-muted-text)]">Classes today</p>
      </div>
      <div className="grid gap-2">
        {classes.slice(0, limit).map((schedule) => (
          <div
            key={schedule.id}
            className="hub-glass-control flex items-start justify-between gap-3 rounded-xl px-3 py-2.5"
          >
            <div className="grid min-w-0 gap-1">
              <p className="break-words text-sm font-medium text-zinc-100">
                {schedule.subject}
              </p>
              <p className="break-words text-xs leading-4 text-[var(--hub-muted-text)]">
                {schedule.room || schedule.instructor || "Class schedule"}
              </p>
            </div>
            <span className="shrink-0 text-xs font-medium text-[var(--hub-accent)]">
              {formatTime(schedule.startTime)}
            </span>
          </div>
        ))}
      </div>
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

function getStat(
  kind: DashboardWidgetKind,
  context: DashboardContext
): { detail?: string; value: number | string } {
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

  if (kind === "total-assignments") {
    return { value: context.assignments.length }
  }

  if (kind === "completed-assignments") {
    return { value: context.completedAssignments.length }
  }

  if (kind === "remaining-assignments") {
    return { value: context.activeAssignments.length }
  }

  return { value: context.activeAssignments.length }
}

function getWidgetItemLimit(widget: DashboardWidget) {
  if (widget.colSpan >= 8 || widget.rowSpan >= 6) {
    return 8
  }

  if (widget.colSpan >= 5 || widget.rowSpan >= 4) {
    return 5
  }

  if (widget.colSpan <= 3 || widget.rowSpan <= 2) {
    return 2
  }

  return 4
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

      if (window.innerWidth < 1024) {
        setColumns(4)
        return
      }

      if (window.innerWidth < 1280) {
        setColumns(6)
        return
      }

      if (window.innerWidth >= 1760) {
        setColumns(16)
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

function normalizeColorInput(color: string, fallback = "#3b82f6") {
  return isValidHexColor(color) ? color : fallback
}

function getDashboardGreeting(now: Date | null) {
  const hour = now?.getHours() ?? 12

  if (hour < 12) {
    return "Good morning, ready to study?"
  }

  if (hour < 18) {
    return "Good afternoon, keep the momentum."
  }

  return "Good evening, plan the next win."
}

function isValidHexColor(color: string) {
  return /^#[0-9a-f]{6}$/i.test(color)
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
