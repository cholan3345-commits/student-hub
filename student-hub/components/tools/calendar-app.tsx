"use client"

import { useMemo, useState, type FormEvent } from "react"
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmButton } from "@/components/ui/confirm-button"
import { EmptyState } from "@/components/ui/empty-state"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/toast"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import {
  addDays,
  formatDateLabel,
  formatTime,
  getCurrentMonthLabel,
  getDateKey,
  getMonthDays,
  parseDateKey,
  startOfWeek,
} from "@/lib/date"
import { getAgendaForDate, type DayAgendaItem } from "@/lib/derived"
import {
  CALENDAR_CATEGORIES,
  CALENDAR_VIEWS,
  type CalendarCategory,
  type CalendarEvent,
  type CalendarView,
} from "@/lib/types"
import { cn } from "@/lib/utils"
import { useAssignments } from "@/hooks/use-assignments"
import { useCalendarEvents, type CalendarEventInput } from "@/hooks/use-calendar-events"
import { useSchedule } from "@/hooks/use-schedule"
import { useSettings } from "@/hooks/use-settings"

const emptyEvent: CalendarEventInput = {
  category: "Personal",
  color: "#3b82f6",
  date: getDateKey(),
  description: "",
  endTime: "10:00",
  startTime: "09:00",
  title: "",
}

export function CalendarApp() {
  const { assignments } = useAssignments()
  const { addEvent, deleteEvent, events, updateEvent } = useCalendarEvents()
  const { schedules } = useSchedule()
  const { settings } = useSettings()
  const { toast } = useToast()
  const [viewOverride, setViewOverride] = useState<CalendarView | null>(null)
  const [selectedDate, setSelectedDate] = useState(getDateKey())
  const [draft, setDraft] = useState<CalendarEventInput>(emptyEvent)
  const [editingId, setEditingId] = useState<string | null>(null)

  const view = viewOverride ?? settings.defaultCalendarView
  const selected = parseDateKey(selectedDate)
  const todayKey = getDateKey()

  const selectedAgenda = useMemo(
    () => getAgendaForDate({ assignments, date: selected, events, schedules }),
    [assignments, events, schedules, selected]
  )

  const monthDays = useMemo(() => getMonthDays(selected), [selected])
  const weekDays = useMemo(() => {
    const start = startOfWeek(selected)
    return Array.from({ length: 7 }, (_, index) => addDays(start, index))
  }, [selected])

  function resetForm(date = selectedDate) {
    setDraft({ ...emptyEvent, date })
    setEditingId(null)
  }

  function editEvent(event: CalendarEvent) {
    setEditingId(event.id)
    setDraft({
      category: event.category,
      color: event.color,
      date: event.date,
      description: event.description,
      endTime: event.endTime,
      startTime: event.startTime,
      title: event.title,
    })
  }

  function submitEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!draft.title.trim()) {
      toast({
        message: "Add a title before saving this event.",
        title: "Title required",
        tone: "error",
      })
      return
    }

    if (editingId) {
      updateEvent(editingId, draft)
      toast({
        message: "The calendar event was updated.",
        title: "Event saved",
        tone: "success",
      })
    } else {
      addEvent(draft)
      toast({
        message: "A new event was added to your calendar.",
        title: "Event added",
        tone: "success",
      })
    }

    setSelectedDate(draft.date)
    resetForm(draft.date)
  }

  function moveCalendar(direction: -1 | 1) {
    const next = new Date(selected)

    if (view === "Monthly") {
      next.setMonth(next.getMonth() + direction)
    } else if (view === "Weekly") {
      next.setDate(next.getDate() + direction * 7)
    } else {
      next.setDate(next.getDate() + direction)
    }

    const nextKey = getDateKey(next)
    setSelectedDate(nextKey)
    setDraft((current) => ({ ...current, date: nextKey }))
  }

  return (
    <PageContainer>
      <PageHeader
        title="Calendar"
        description="View academic events and important dates in one place."
      />

      <div className="grid gap-4 xl:grid-cols-[24rem_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Event" : "Add Event"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={submitEvent}>
              <Field label="Title">
                <Input
                  value={draft.title}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="Study group"
                />
              </Field>
              <Field label="Date">
                <Input
                  type="date"
                  value={draft.date}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, date: event.target.value }))
                  }
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Start Time">
                  <Input
                    type="time"
                    value={draft.startTime}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        startTime: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="End Time">
                  <Input
                    type="time"
                    value={draft.endTime}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, endTime: event.target.value }))
                    }
                  />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Category">
                  <Select
                    value={draft.category}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        category: event.target.value as CalendarCategory,
                      }))
                    }
                  >
                    {CALENDAR_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Color">
                  <Input
                    type="color"
                    value={draft.color}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, color: event.target.value }))
                    }
                    className="h-10 p-1"
                    aria-label="Event color"
                  />
                </Field>
              </div>
              <Field label="Description">
                <Textarea
                  value={draft.description}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Location, agenda, or reminders."
                />
              </Field>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="submit"
                  className="h-10 rounded-xl px-4"
                >
                  <Plus className="size-4" aria-hidden="true" />
                  {editingId ? "Save Changes" : "Add Event"}
                </Button>
                {editingId ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => resetForm()}
                    className="h-10 rounded-xl border border-white/10 bg-white/[0.04] text-zinc-100"
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card>
            <CardContent className="flex flex-col gap-4 pt-4 sm:pt-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="grid w-full min-w-0 grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-3 lg:w-auto lg:min-w-80">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-lg"
                  onClick={() => moveCalendar(-1)}
                  aria-label="Previous date range"
                  className="size-10 shrink-0 rounded-xl"
                >
                  <ChevronLeft className="size-4" aria-hidden="true" />
                </Button>
                <div className="grid min-w-0 gap-1 text-center">
                  <p className="break-words text-base font-semibold leading-6 text-zinc-50">
                    {view === "Monthly"
                      ? getCurrentMonthLabel(selected)
                      : view === "Weekly"
                        ? `Week of ${formatDateLabel(getDateKey(startOfWeek(selected)))}`
                        : formatDateLabel(selectedDate, {
                            weekday: "long",
                          })}
                  </p>
                  <p className="break-words text-sm leading-5 text-zinc-500">
                    Selected {formatDateLabel(selectedDate)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-lg"
                  onClick={() => moveCalendar(1)}
                  aria-label="Next date range"
                  className="size-10 shrink-0 rounded-xl"
                >
                  <ChevronRight className="size-4" aria-hidden="true" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {CALENDAR_VIEWS.map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant={view === option ? "default" : "ghost"}
                    onClick={() => setViewOverride(option)}
                    className={cn(
                      "h-10 rounded-xl border border-white/10 px-4",
                      view === option ? "hub-accent-bg" : "hub-glass-control text-zinc-100"
                    )}
                  >
                    {option}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    const key = getDateKey()
                    setSelectedDate(key)
                    setDraft((current) => ({ ...current, date: key }))
                  }}
                  className="h-10 rounded-xl border border-white/10 bg-white/[0.04] text-zinc-100"
                >
                  Today
                </Button>
              </div>
            </CardContent>
          </Card>

          {view === "Monthly" ? (
            <MonthView
              assignments={assignments}
              events={events}
              monthDays={monthDays}
              schedules={schedules}
              selectedDate={selectedDate}
              todayKey={todayKey}
              onSelect={(dateKey) => {
                setSelectedDate(dateKey)
                setDraft((current) => ({ ...current, date: dateKey }))
              }}
            />
          ) : view === "Weekly" ? (
            <WeekView
              assignments={assignments}
              events={events}
              schedules={schedules}
              selectedDate={selectedDate}
              todayKey={todayKey}
              weekDays={weekDays}
              onSelect={(dateKey) => {
                setSelectedDate(dateKey)
                setDraft((current) => ({ ...current, date: dateKey }))
              }}
            />
          ) : (
            <DayView
              agenda={selectedAgenda}
              events={events}
              onDelete={(event) => {
                deleteEvent(event.id)
                toast({
                  message: "The event was deleted.",
                  title: "Event deleted",
                  tone: "info",
                })
              }}
              onEdit={editEvent}
            />
          )}

          <DayView
            agenda={selectedAgenda}
            compact
            events={events}
            title={`Events on ${formatDateLabel(selectedDate)}`}
            onDelete={(event) => {
              deleteEvent(event.id)
              toast({
                message: "The event was deleted.",
                title: "Event deleted",
                tone: "info",
              })
            }}
            onEdit={editEvent}
          />
        </div>
      </div>
    </PageContainer>
  )
}

function MonthView({
  assignments,
  events,
  monthDays,
  onSelect,
  schedules,
  selectedDate,
  todayKey,
}: {
  assignments: Parameters<typeof getAgendaForDate>[0]["assignments"]
  events: CalendarEvent[]
  monthDays: Date[]
  onSelect: (dateKey: string) => void
  schedules: Parameters<typeof getAgendaForDate>[0]["schedules"]
  selectedDate: string
  todayKey: string
}) {
  return (
    <Card>
      <CardContent className="pt-4 sm:pt-5">
        <div className="grid grid-cols-7 gap-1 text-center text-[0.65rem] font-medium uppercase text-zinc-500 sm:gap-2 sm:text-xs">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1 sm:gap-2">
          {monthDays.map((date) => {
            const key = getDateKey(date)
            const agenda = getAgendaForDate({ assignments, date, events, schedules })

            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelect(key)}
                className={cn(
                  "hub-glass-control grid min-h-20 min-w-0 content-start gap-2 rounded-xl p-1.5 text-left transition-[color,background-color,border-color,box-shadow] duration-200 ease-out hover:border-[var(--hub-accent-border)] hover:bg-[var(--hub-accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hub-accent-ring)] sm:min-h-24 sm:rounded-2xl sm:p-2",
                  key === todayKey && "border-[var(--hub-accent-border)]",
                  key === selectedDate && "bg-[var(--hub-accent-soft)]"
                )}
              >
                <span
                  className={cn(
                    "inline-flex size-7 items-center justify-center rounded-lg text-sm font-semibold text-zinc-300",
                    key === todayKey && "hub-accent-bg"
                  )}
                >
                  {date.getDate()}
                </span>
                <div className="grid gap-1">
                  {agenda.slice(0, 3).map((item) => (
                    <span
                      key={item.id}
                      className="line-clamp-2 break-words rounded-md px-1.5 py-1 text-[0.65rem] leading-4 text-zinc-100 sm:text-[0.68rem]"
                      style={{ backgroundColor: `${item.color}33` }}
                    >
                      {item.title}
                    </span>
                  ))}
                  {agenda.length > 3 ? (
                    <span className="text-[0.68rem] text-zinc-500">
                      +{agenda.length - 3} more
                    </span>
                  ) : null}
                </div>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function WeekView({
  assignments,
  events,
  onSelect,
  schedules,
  selectedDate,
  todayKey,
  weekDays,
}: {
  assignments: Parameters<typeof getAgendaForDate>[0]["assignments"]
  events: CalendarEvent[]
  onSelect: (dateKey: string) => void
  schedules: Parameters<typeof getAgendaForDate>[0]["schedules"]
  selectedDate: string
  todayKey: string
  weekDays: Date[]
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-7">
      {weekDays.map((date) => {
        const key = getDateKey(date)
        const agenda = getAgendaForDate({ assignments, date, events, schedules })

        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className={cn(
              "hub-glass-control rounded-2xl p-4 text-left shadow-xl shadow-black/20 transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-[var(--hub-accent-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hub-accent-ring)]",
              key === selectedDate &&
                "border-[var(--hub-accent-border)] bg-[var(--hub-accent-soft)]",
              key === todayKey && "border-[var(--hub-accent-border)]"
            )}
          >
            <div className="grid gap-1">
              <p className="text-sm font-semibold leading-5 text-zinc-50">
                {date.toLocaleDateString(undefined, { weekday: "short" })}
              </p>
              <p className="text-xs leading-4 text-zinc-500">{formatDateLabel(key)}</p>
            </div>
            <div className="mt-4 grid gap-2">
              {agenda.length > 0 ? (
                agenda.slice(0, 4).map((item) => <AgendaPill key={item.id} item={item} />)
              ) : (
                <p className="text-xs text-zinc-600">No events</p>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}

function DayView({
  agenda,
  compact,
  events,
  onDelete,
  onEdit,
  title = "Daily Agenda",
}: {
  agenda: DayAgendaItem[]
  compact?: boolean
  events: CalendarEvent[]
  onDelete: (event: CalendarEvent) => void
  onEdit: (event: CalendarEvent) => void
  title?: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {agenda.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Nothing scheduled"
            description="This day is clear across events, classes, and assignments."
          />
        ) : (
          <div className={cn("grid gap-3", compact && "md:grid-cols-2")}>
            {agenda.map((item) => {
              const event = item.source === "event" ? events.find((entry) => `event-${entry.id}` === item.id) : null

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid min-w-0 gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="size-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                          aria-hidden="true"
                        />
                        <h3 className="break-words text-sm font-semibold text-zinc-50">
                          {item.title}
                        </h3>
                        <Badge tone={item.source === "assignment" ? "yellow" : "zinc"}>
                          {item.category}
                        </Badge>
                      </div>
                      <p className="text-sm leading-5 text-zinc-500">
                        {item.startTime
                          ? `${formatTime(item.startTime)} - ${formatTime(item.endTime)}`
                          : "All day"}
                      </p>
                      {item.description ? (
                        <p className="break-words text-sm leading-6 text-zinc-400">
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                    {event ? (
                      <div className="flex shrink-0 gap-1.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-lg"
                          onClick={() => onEdit(event)}
                          aria-label="Edit event"
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                        </Button>
                        <ConfirmButton
                          type="button"
                          variant="destructive"
                          size="icon-lg"
                          confirmMessage="Delete this event?"
                          onConfirm={() => onDelete(event)}
                          aria-label="Delete event"
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </ConfirmButton>
                      </div>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function AgendaPill({ item }: { item: DayAgendaItem }) {
  return (
    <span
      className="block break-words rounded-lg px-2 py-1.5 text-xs leading-5 text-zinc-100"
      style={{ backgroundColor: `${item.color}33` }}
    >
      {item.startTime ? `${formatTime(item.startTime)} - ` : ""}
      {item.title}
    </span>
  )
}
