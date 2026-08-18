"use client"

import { useMemo, useState, type FormEvent } from "react"
import {
  ArrowUpDown,
  CalendarClock,
  Copy,
  Grid2X2,
  Pencil,
  Plus,
  Table2,
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
import { compareTimes, formatTime, getWeekday } from "@/lib/date"
import { WEEKDAYS, type ScheduleItem, type Weekday } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useSchedule, type ScheduleInput } from "@/hooks/use-schedule"

const emptySchedule: ScheduleInput = {
  color: "#3b82f6",
  day: "Monday",
  endTime: "10:00",
  instructor: "",
  notes: "",
  room: "",
  startTime: "09:00",
  subject: "",
}

export function ScheduleManager() {
  const { addSchedule, deleteSchedule, duplicateSchedule, schedules, updateSchedule } =
    useSchedule()
  const { toast } = useToast()
  const [draft, setDraft] = useState<ScheduleInput>(emptySchedule)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [dayFilter, setDayFilter] = useState<"All" | Weekday>("All")
  const [subjectFilter, setSubjectFilter] = useState("All")
  const [view, setView] = useState<"cards" | "table">("cards")

  const today = getWeekday()

  const subjects = useMemo(
    () => Array.from(new Set(schedules.map((item) => item.subject).filter(Boolean))).sort(),
    [schedules]
  )

  const filteredSchedules = useMemo(() => {
    const search = query.trim().toLowerCase()

    return schedules
      .filter((item) => {
        const matchesQuery =
          !search ||
          [
            item.subject,
            item.day,
            item.room,
            item.instructor,
            item.notes,
            item.startTime,
            item.endTime,
          ]
            .join(" ")
            .toLowerCase()
            .includes(search)
        const matchesDay = dayFilter === "All" || item.day === dayFilter
        const matchesSubject =
          subjectFilter === "All" || item.subject === subjectFilter

        return matchesQuery && matchesDay && matchesSubject
      })
      .sort((a, b) => compareTimes(a.startTime, b.startTime))
  }, [dayFilter, query, schedules, subjectFilter])

  function resetForm() {
    setDraft(emptySchedule)
    setEditingId(null)
  }

  function editSchedule(item: ScheduleItem) {
    setEditingId(item.id)
    setDraft({
      color: item.color,
      day: item.day,
      endTime: item.endTime,
      instructor: item.instructor,
      notes: item.notes,
      room: item.room,
      startTime: item.startTime,
      subject: item.subject,
    })
  }

  function submitSchedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!draft.subject.trim()) {
      toast({
        message: "Add a subject before saving this class.",
        title: "Subject required",
        tone: "error",
      })
      return
    }

    if (editingId) {
      updateSchedule(editingId, draft)
      toast({
        message: "Your schedule item was updated.",
        title: "Schedule saved",
        tone: "success",
      })
    } else {
      addSchedule(draft)
      toast({
        message: "A new class was added to your schedule.",
        title: "Schedule added",
        tone: "success",
      })
    }

    resetForm()
  }

  return (
    <PageContainer>
      <PageHeader
        title="Schedule"
        description="Plan classes, study blocks, and campus commitments."
      />

      <div className="grid gap-4 xl:grid-cols-[24rem_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Schedule" : "Add Schedule"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={submitSchedule}>
              <Field label="Subject">
                <Input
                  value={draft.subject}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, subject: event.target.value }))
                  }
                  placeholder="Mathematics"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Day">
                  <Select
                    value={draft.day}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        day: event.target.value as Weekday,
                      }))
                    }
                  >
                    {WEEKDAYS.map((day) => (
                      <option key={day} value={day}>
                        {day}
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
                    aria-label="Schedule color"
                  />
                </Field>
              </div>
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
                <Field label="Room">
                  <Input
                    value={draft.room}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, room: event.target.value }))
                    }
                    placeholder="Room 204"
                  />
                </Field>
                <Field label="Instructor">
                  <Input
                    value={draft.instructor}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        instructor: event.target.value,
                      }))
                    }
                    placeholder="Prof. Santos"
                  />
                </Field>
              </div>
              <Field label="Notes">
                <Textarea
                  value={draft.notes}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, notes: event.target.value }))
                  }
                  placeholder="Bring lab notebook, readings, or reminders."
                />
              </Field>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="submit"
                  className="h-10 rounded-xl px-4"
                >
                  <Plus className="size-4" aria-hidden="true" />
                  {editingId ? "Save Changes" : "Add Schedule"}
                </Button>
                {editingId ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={resetForm}
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
            <CardContent className="pt-4 sm:pt-5">
              <div className="grid gap-3 lg:grid-cols-[1fr_12rem_12rem_auto] lg:items-center">
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search schedule"
                  aria-label="Search schedule"
                />
                <Select
                  value={dayFilter}
                  onChange={(event) =>
                    setDayFilter(event.target.value as "All" | Weekday)
                  }
                  aria-label="Filter by day"
                >
                  <option value="All">All days</option>
                  {WEEKDAYS.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </Select>
                <Select
                  value={subjectFilter}
                  onChange={(event) => setSubjectFilter(event.target.value)}
                  aria-label="Filter by subject"
                >
                  <option value="All">All subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </Select>
                <div className="flex gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1">
                  <Button
                    type="button"
                    variant={view === "cards" ? "default" : "ghost"}
                    size="icon-lg"
                    onClick={() => setView("cards")}
                    aria-label="Card view"
                    className={cn(view === "cards" && "hub-accent-bg")}
                  >
                    <Grid2X2 className="size-4" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant={view === "table" ? "default" : "ghost"}
                    size="icon-lg"
                    onClick={() => setView("table")}
                    aria-label="Table view"
                    className={cn(view === "table" && "hub-accent-bg")}
                  >
                    <Table2 className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {filteredSchedules.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title="No schedule items"
              description="Add your classes or adjust the filters to see them here."
            />
          ) : view === "cards" ? (
            <div className="grid gap-3 md:grid-cols-2">
              {filteredSchedules.map((item) => (
                <ScheduleCard
                  key={item.id}
                  item={item}
                  isToday={item.day === today}
                  onDelete={() => {
                    deleteSchedule(item.id)
                    toast({
                      message: "The schedule item was deleted.",
                      title: "Schedule deleted",
                      tone: "info",
                    })
                  }}
                  onDuplicate={() => {
                    duplicateSchedule(item.id)
                    toast({
                      message: "A copy was added to your schedule.",
                      title: "Schedule duplicated",
                      tone: "success",
                    })
                  }}
                  onEdit={() => editSchedule(item)}
                />
              ))}
            </div>
          ) : (
            <ScheduleTable
              items={filteredSchedules}
              today={today}
              onDelete={(item) => {
                deleteSchedule(item.id)
                toast({
                  message: "The schedule item was deleted.",
                  title: "Schedule deleted",
                  tone: "info",
                })
              }}
              onDuplicate={(item) => {
                duplicateSchedule(item.id)
                toast({
                  message: "A copy was added to your schedule.",
                  title: "Schedule duplicated",
                  tone: "success",
                })
              }}
              onEdit={editSchedule}
            />
          )}
        </div>
      </div>
    </PageContainer>
  )
}

function ScheduleCard({
  isToday,
  item,
  onDelete,
  onDuplicate,
  onEdit,
}: {
  isToday: boolean
  item: ScheduleItem
  onDelete: () => void
  onDuplicate: () => void
  onEdit: () => void
}) {
  return (
    <Card
      className={cn(
        "transition-[transform,border-color,background-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-[var(--hub-accent-border)]",
        isToday && "border-[var(--hub-accent-border)] bg-[var(--hub-accent-soft)]"
      )}
    >
      <CardContent className="pt-4 sm:pt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="grid min-w-0 flex-1 gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              <h3 className="break-words text-base font-semibold text-zinc-50">
                {item.subject}
              </h3>
              {isToday ? <Badge tone="blue">Today</Badge> : null}
            </div>
            <div className="grid gap-1.5 text-sm leading-5">
              <p className="break-words text-zinc-400">
                {item.day} - {formatTime(item.startTime)} - {formatTime(item.endTime)}
              </p>
              <p className="break-words text-zinc-500">
                {[item.room, item.instructor].filter(Boolean).join(" - ") ||
                  "No room or instructor"}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-1.5">
            <Button type="button" variant="ghost" size="icon-lg" onClick={onEdit} aria-label="Edit schedule">
              <Pencil className="size-4" aria-hidden="true" />
            </Button>
            <Button type="button" variant="ghost" size="icon-lg" onClick={onDuplicate} aria-label="Duplicate schedule">
              <Copy className="size-4" aria-hidden="true" />
            </Button>
            <ConfirmButton
              type="button"
              variant="destructive"
              size="icon-lg"
              confirmMessage="Delete this schedule item?"
              onConfirm={onDelete}
              aria-label="Delete schedule"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </ConfirmButton>
          </div>
        </div>
        {item.notes ? (
          <p className="mt-4 break-words rounded-xl border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-400">
            {item.notes}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}

function ScheduleTable({
  items,
  onDelete,
  onDuplicate,
  onEdit,
  today,
}: {
  items: ScheduleItem[]
  onDelete: (item: ScheduleItem) => void
  onDuplicate: (item: ScheduleItem) => void
  onEdit: (item: ScheduleItem) => void
  today: Weekday
}) {
  return (
    <Card>
      <div className="grid gap-3 p-4 md:hidden">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm text-zinc-300",
              item.day === today &&
                "border-[var(--hub-accent-border)] bg-[var(--hub-accent-soft)] text-[var(--hub-text)]"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="grid min-w-0 gap-1.5">
                <p className="break-words font-medium text-zinc-50">{item.subject}</p>
                <p className="text-zinc-500">
                  {item.day} - {formatTime(item.startTime)} - {formatTime(item.endTime)}
                </p>
                <p className="break-words text-zinc-500">
                  {[item.room, item.instructor].filter(Boolean).join(" - ") || "-"}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Button type="button" variant="ghost" size="icon-lg" onClick={() => onEdit(item)} aria-label="Edit schedule">
                <Pencil className="size-4" aria-hidden="true" />
              </Button>
              <Button type="button" variant="ghost" size="icon-lg" onClick={() => onDuplicate(item)} aria-label="Duplicate schedule">
                <Copy className="size-4" aria-hidden="true" />
              </Button>
              <ConfirmButton
                type="button"
                variant="destructive"
                size="icon-lg"
                confirmMessage="Delete this schedule item?"
                onConfirm={() => onDelete(item)}
                aria-label="Delete schedule"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </ConfirmButton>
            </div>
          </div>
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[52rem] text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Subject</th>
              <th className="px-4 py-3 font-medium">Day</th>
              <th className="px-4 py-3 font-medium">
                <span className="inline-flex items-center gap-1.5">
                  Time <ArrowUpDown className="size-3" aria-hidden="true" />
                </span>
              </th>
              <th className="px-4 py-3 font-medium">Room</th>
              <th className="px-4 py-3 font-medium">Instructor</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className={cn(
                  "border-b border-white/5 text-zinc-300",
                  item.day === today && "bg-[var(--hub-accent-soft)] text-[var(--hub-text)]"
                )}
              >
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-2 font-medium">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                      aria-hidden="true"
                    />
                    {item.subject}
                  </span>
                </td>
                <td className="px-4 py-3">{item.day}</td>
                <td className="px-4 py-3">
                  {formatTime(item.startTime)} - {formatTime(item.endTime)}
                </td>
                <td className="px-4 py-3">{item.room || "-"}</td>
                <td className="px-4 py-3">{item.instructor || "-"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <Button type="button" variant="ghost" size="icon-lg" onClick={() => onEdit(item)} aria-label="Edit schedule">
                      <Pencil className="size-4" aria-hidden="true" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon-lg" onClick={() => onDuplicate(item)} aria-label="Duplicate schedule">
                      <Copy className="size-4" aria-hidden="true" />
                    </Button>
                    <ConfirmButton
                      type="button"
                      variant="destructive"
                      size="icon-lg"
                      confirmMessage="Delete this schedule item?"
                      onConfirm={() => onDelete(item)}
                      aria-label="Delete schedule"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </ConfirmButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
