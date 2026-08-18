"use client"

import { useMemo, useState, type FormEvent } from "react"
import { CheckCircle2, Pencil, Plus, Repeat2, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmButton } from "@/components/ui/confirm-button"
import { EmptyState } from "@/components/ui/empty-state"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/toast"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { addDays, getDateKey, parseDateKey, startOfWeek } from "@/lib/date"
import type { Habit } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useHabits, type HabitInput } from "@/hooks/use-habits"

const emptyHabit: HabitInput = {
  color: "#3b82f6",
  completionDates: [],
  description: "",
  name: "",
}

export function HabitTracker() {
  const { addHabit, deleteHabit, habits, toggleToday, updateHabit } = useHabits()
  const { toast } = useToast()
  const [draft, setDraft] = useState<HabitInput>(emptyHabit)
  const [editingId, setEditingId] = useState<string | null>(null)

  const summary = useMemo(() => {
    const today = getDateKey()
    const completedToday = habits.filter((habit) =>
      habit.completionDates.includes(today)
    ).length

    return {
      completedToday,
      total: habits.length,
      weekly: habits.length
        ? Math.round(
            habits.reduce((sum, habit) => sum + getWeeklyProgress(habit), 0) /
              habits.length
          )
        : 0,
    }
  }, [habits])

  function resetForm() {
    setDraft(emptyHabit)
    setEditingId(null)
  }

  function editHabit(habit: Habit) {
    setEditingId(habit.id)
    setDraft({
      color: habit.color,
      completionDates: habit.completionDates,
      description: habit.description,
      name: habit.name,
    })
  }

  function submitHabit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!draft.name.trim()) {
      toast({
        message: "Add a habit name before saving.",
        title: "Habit required",
        tone: "error",
      })
      return
    }

    if (editingId) {
      updateHabit(editingId, draft)
      toast({
        message: "The habit was updated.",
        title: "Habit saved",
        tone: "success",
      })
    } else {
      addHabit(draft)
      toast({
        message: "A new habit was added.",
        title: "Habit added",
        tone: "success",
      })
    }

    resetForm()
  }

  return (
    <PageContainer>
      <PageHeader
        title="Habit Tracker"
        description="Build repeatable routines for school and life."
      />

      <div className="grid gap-4 xl:grid-cols-[24rem_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Habit" : "Add Habit"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={submitHabit}>
              <Field label="Habit">
                <Input
                  value={draft.name}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Review lecture notes"
                />
              </Field>
              <Field label="Description">
                <Textarea
                  value={draft.description}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="What counts as complete?"
                />
              </Field>
              <Field label="Color">
                <Input
                  type="color"
                  value={draft.color}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, color: event.target.value }))
                  }
                  className="h-10 p-1"
                />
              </Field>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="submit"
                  className="h-10 rounded-xl px-4"
                >
                  <Plus className="size-4" aria-hidden="true" />
                  {editingId ? "Save Changes" : "Add Habit"}
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
          <div className="grid gap-3 md:grid-cols-3">
            <StatCard label="Habits" value={summary.total} />
            <StatCard
              label="Completed Today"
              value={`${summary.completedToday}/${summary.total}`}
            />
            <StatCard label="Weekly Avg" value={`${summary.weekly}%`} />
          </div>

          {habits.length === 0 ? (
            <EmptyState
              icon={Repeat2}
              title="No habits yet"
              description="Add a habit and mark it complete to build momentum."
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onDelete={() => {
                    deleteHabit(habit.id)
                    toast({
                      message: "The habit was deleted.",
                      title: "Habit deleted",
                      tone: "info",
                    })
                  }}
                  onEdit={() => editHabit(habit)}
                  onToggle={() => {
                    toggleToday(habit.id)
                    toast({
                      message: "Today's habit status was updated.",
                      title: "Habit updated",
                      tone: "success",
                    })
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}

function HabitCard({
  habit,
  onDelete,
  onEdit,
  onToggle,
}: {
  habit: Habit
  onDelete: () => void
  onEdit: () => void
  onToggle: () => void
}) {
  const completedToday = habit.completionDates.includes(getDateKey())
  const weekly = getWeeklyProgress(habit)
  const monthly = getMonthlyProgress(habit)
  const streak = getDailyStreak(habit)

  return (
    <Card
      className={cn(
        "transition-[transform,border-color,background-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-[var(--hub-accent-border)]",
        completedToday && "border-emerald-400/30 bg-emerald-500/[0.055]"
      )}
    >
      <CardContent className="pt-4 sm:pt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: habit.color }}
                aria-hidden="true"
              />
              <h3 className="break-words text-base font-semibold text-zinc-50">
                {habit.name}
              </h3>
            </div>
            {habit.description ? (
              <p className="mt-2 break-words text-sm leading-6 text-zinc-500">{habit.description}</p>
            ) : null}
          </div>
          <Badge tone={completedToday ? "green" : "zinc"}>
            {completedToday ? "Done" : "Open"}
          </Badge>
        </div>

        <div className="mt-4 grid gap-3 text-sm text-zinc-400">
          <Metric label="Daily Streak" value={`${streak} day${streak === 1 ? "" : "s"}`} />
          <ProgressMetric label="Weekly Progress" value={weekly} />
          <ProgressMetric label="Monthly Progress" value={monthly} />
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <Button
            type="button"
            onClick={onToggle}
            className={cn(
              "h-10 rounded-xl px-4",
              completedToday
                ? "bg-emerald-500/85 text-white hover:bg-emerald-400"
                : "hub-accent-bg"
            )}
          >
            <CheckCircle2 className="size-4" aria-hidden="true" />
            {completedToday ? "Completed" : "Mark Complete"}
          </Button>
          <Button type="button" variant="ghost" size="icon-lg" onClick={onEdit} aria-label="Edit habit">
            <Pencil className="size-4" aria-hidden="true" />
          </Button>
          <ConfirmButton
            type="button"
            variant="destructive"
            size="icon-lg"
            confirmMessage="Delete this habit?"
            onConfirm={onDelete}
            aria-label="Delete habit"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </ConfirmButton>
        </div>
      </CardContent>
    </Card>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span>{label}</span>
      <span className="font-medium text-zinc-100">{value}</span>
    </div>
  )
}

function ProgressMetric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <Metric label={label} value={`${value}%`} />
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full rounded-full bg-[var(--hub-accent)]" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function getDailyStreak(habit: Habit) {
  const completed = new Set(habit.completionDates)
  let streak = 0
  let cursor = parseDateKey(getDateKey())

  while (completed.has(getDateKey(cursor))) {
    streak += 1
    cursor = addDays(cursor, -1)
  }

  return streak
}

function getWeeklyProgress(habit: Habit) {
  const start = startOfWeek(new Date())
  const days = Array.from({ length: 7 }, (_, index) => getDateKey(addDays(start, index)))
  const completed = days.filter((day) => habit.completionDates.includes(day)).length

  return Math.round((completed / 7) * 100)
}

function getMonthlyProgress(habit: Habit) {
  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const completed = habit.completionDates.filter((date) => {
    const parsed = parseDateKey(date)
    return parsed.getMonth() === now.getMonth() && parsed.getFullYear() === now.getFullYear()
  }).length

  return Math.round((completed / daysInMonth) * 100)
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <CardContent className="pt-4 sm:pt-5">
        <p className="text-sm text-zinc-500">{label}</p>
        <p className="mt-2 break-words text-2xl font-semibold text-zinc-50 sm:text-3xl">{value}</p>
      </CardContent>
    </Card>
  )
}
