"use client"

import { useMemo, useState, type FormEvent } from "react"
import {
  CheckCircle2,
  ClipboardList,
  Copy,
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
import { compareDateKeys, formatDateLabel, getDateKey, isPastDate } from "@/lib/date"
import {
  ASSIGNMENT_PRIORITIES,
  ASSIGNMENT_STATUSES,
  type Assignment,
  type AssignmentPriority,
  type AssignmentStatus,
} from "@/lib/types"
import { cn } from "@/lib/utils"
import { useAssignments, type AssignmentInput } from "@/hooks/use-assignments"

const emptyAssignment: AssignmentInput = {
  description: "",
  dueDate: getDateKey(),
  notes: "",
  priority: "Medium",
  progress: 0,
  status: "Not Started",
  subject: "",
  title: "",
}

export function AssignmentManager() {
  const {
    addAssignment,
    assignments,
    deleteAssignment,
    duplicateAssignment,
    toggleAssignmentComplete,
    updateAssignment,
  } = useAssignments()
  const { toast } = useToast()
  const [draft, setDraft] = useState<AssignmentInput>(emptyAssignment)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("All")
  const [priorityFilter, setPriorityFilter] = useState<"All" | AssignmentPriority>("All")
  const [statusFilter, setStatusFilter] = useState<"All" | AssignmentStatus>("All")

  const subjects = useMemo(
    () =>
      Array.from(new Set(assignments.map((item) => item.subject).filter(Boolean))).sort(),
    [assignments]
  )

  const filteredAssignments = useMemo(() => {
    const search = query.trim().toLowerCase()

    return assignments
      .filter((item) => {
        const matchesQuery =
          !search ||
          [item.title, item.subject, item.description, item.notes, item.priority, item.status]
            .join(" ")
            .toLowerCase()
            .includes(search)
        const matchesSubject =
          subjectFilter === "All" || item.subject === subjectFilter
        const matchesPriority =
          priorityFilter === "All" || item.priority === priorityFilter
        const matchesStatus = statusFilter === "All" || item.status === statusFilter

        return matchesQuery && matchesSubject && matchesPriority && matchesStatus
      })
      .sort((a, b) => compareDateKeys(a.dueDate, b.dueDate))
  }, [assignments, priorityFilter, query, statusFilter, subjectFilter])

  function resetForm() {
    setDraft(emptyAssignment)
    setEditingId(null)
  }

  function editAssignment(item: Assignment) {
    setEditingId(item.id)
    setDraft({
      description: item.description,
      dueDate: item.dueDate,
      notes: item.notes,
      priority: item.priority,
      progress: item.progress,
      status: item.status,
      subject: item.subject,
      title: item.title,
    })
  }

  function submitAssignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!draft.title.trim()) {
      toast({
        message: "Add a title before saving this assignment.",
        title: "Title required",
        tone: "error",
      })
      return
    }

    const nextDraft = {
      ...draft,
      progress: Math.min(100, Math.max(0, Number(draft.progress) || 0)),
    }

    if (editingId) {
      updateAssignment(editingId, nextDraft)
      toast({
        message: "Your assignment was updated.",
        title: "Assignment saved",
        tone: "success",
      })
    } else {
      addAssignment(nextDraft)
      toast({
        message: "A new assignment was added.",
        title: "Assignment added",
        tone: "success",
      })
    }

    resetForm()
  }

  return (
    <PageContainer>
      <PageHeader
        title="Assignments"
        description="Track coursework, due dates, and upcoming submissions."
      />

      <div className="grid gap-4 xl:grid-cols-[24rem_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Assignment" : "Add Assignment"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={submitAssignment}>
              <Field label="Title">
                <Input
                  value={draft.title}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="Biology lab report"
                />
              </Field>
              <Field label="Subject">
                <Input
                  value={draft.subject}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, subject: event.target.value }))
                  }
                  placeholder="Biology"
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
                  placeholder="Summarize the task, links, or rubric notes."
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Due Date">
                  <Input
                    type="date"
                    value={draft.dueDate}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, dueDate: event.target.value }))
                    }
                  />
                </Field>
                <Field label="Priority">
                  <Select
                    value={draft.priority}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        priority: event.target.value as AssignmentPriority,
                      }))
                    }
                  >
                    {ASSIGNMENT_PRIORITIES.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Status">
                  <Select
                    value={draft.status}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        status: event.target.value as AssignmentStatus,
                        progress:
                          event.target.value === "Completed" ? 100 : current.progress,
                      }))
                    }
                  >
                    {ASSIGNMENT_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label={`Progress ${draft.progress}%`}>
                  <Input
                    type="range"
                    min={0}
                    max={100}
                    value={draft.progress}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        progress: Number(event.target.value),
                        status:
                          Number(event.target.value) === 100
                            ? "Completed"
                            : Number(event.target.value) > 0
                              ? "In Progress"
                              : "Not Started",
                      }))
                    }
                  />
                </Field>
              </div>
              <Field label="Notes">
                <Textarea
                  value={draft.notes}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, notes: event.target.value }))
                  }
                  placeholder="Submission details, reminders, or checklist notes."
                />
              </Field>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="submit"
                  className="h-10 rounded-xl bg-blue-500/85 px-4 text-white hover:bg-blue-400"
                >
                  <Plus className="size-4" aria-hidden="true" />
                  {editingId ? "Save Changes" : "Add Assignment"}
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
            <CardContent className="pt-5">
              <div className="grid gap-3 lg:grid-cols-[1fr_12rem_12rem_12rem]">
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search assignments"
                  aria-label="Search assignments"
                />
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
                <Select
                  value={priorityFilter}
                  onChange={(event) =>
                    setPriorityFilter(event.target.value as "All" | AssignmentPriority)
                  }
                  aria-label="Filter by priority"
                >
                  <option value="All">All priorities</option>
                  {ASSIGNMENT_PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </Select>
                <Select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as "All" | AssignmentStatus)
                  }
                  aria-label="Filter by status"
                >
                  <option value="All">All statuses</option>
                  {ASSIGNMENT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
              </div>
            </CardContent>
          </Card>

          {filteredAssignments.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No assignments"
              description="Add an assignment or adjust the filters to see your coursework."
            />
          ) : (
            <div className="grid gap-3">
              {filteredAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onDelete={() => {
                    deleteAssignment(assignment.id)
                    toast({
                      message: "The assignment was deleted.",
                      title: "Assignment deleted",
                      tone: "info",
                    })
                  }}
                  onDuplicate={() => {
                    duplicateAssignment(assignment.id)
                    toast({
                      message: "A copy was added to your assignments.",
                      title: "Assignment duplicated",
                      tone: "success",
                    })
                  }}
                  onEdit={() => editAssignment(assignment)}
                  onToggleComplete={() => {
                    toggleAssignmentComplete(assignment.id)
                    toast({
                      message:
                        assignment.status === "Completed"
                          ? "Assignment moved back to active."
                          : "Assignment marked complete.",
                      title: "Status updated",
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

function AssignmentCard({
  assignment,
  onDelete,
  onDuplicate,
  onEdit,
  onToggleComplete,
}: {
  assignment: Assignment
  onDelete: () => void
  onDuplicate: () => void
  onEdit: () => void
  onToggleComplete: () => void
}) {
  const overdue = assignment.status !== "Completed" && isPastDate(assignment.dueDate)
  const completed = assignment.status === "Completed"

  return (
    <Card
      className={cn(
        "transition duration-200 hover:-translate-y-0.5 hover:border-blue-400/40",
        overdue && "border-red-400/30 bg-red-500/[0.055]",
        completed && "border-emerald-400/30 bg-emerald-500/[0.055]"
      )}
    >
      <CardContent className="pt-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-semibold text-zinc-50">
                {assignment.title}
              </h3>
              <Badge
                tone={
                  completed
                    ? "green"
                    : overdue
                      ? "red"
                      : assignment.priority === "High"
                        ? "yellow"
                        : "zinc"
                }
              >
                {completed ? "Completed" : overdue ? "Overdue" : assignment.priority}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-zinc-400">
              {assignment.subject || "No subject"} - Due{" "}
              {formatDateLabel(assignment.dueDate)}
            </p>
            {assignment.description ? (
              <p className="mt-3 text-sm leading-6 text-zinc-500">
                {assignment.description}
              </p>
            ) : null}
            <div className="mt-4">
              <div className="mb-2 flex justify-between text-xs text-zinc-500">
                <span>{assignment.status}</span>
                <span>{assignment.progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    completed ? "bg-emerald-400" : overdue ? "bg-red-400" : "bg-blue-400"
                  )}
                  style={{ width: `${assignment.progress}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 lg:justify-end">
            <Button type="button" variant="ghost" size="icon-lg" onClick={onToggleComplete} aria-label="Toggle assignment complete">
              <CheckCircle2 className="size-4" aria-hidden="true" />
            </Button>
            <Button type="button" variant="ghost" size="icon-lg" onClick={onEdit} aria-label="Edit assignment">
              <Pencil className="size-4" aria-hidden="true" />
            </Button>
            <Button type="button" variant="ghost" size="icon-lg" onClick={onDuplicate} aria-label="Duplicate assignment">
              <Copy className="size-4" aria-hidden="true" />
            </Button>
            <ConfirmButton
              type="button"
              variant="destructive"
              size="icon-lg"
              confirmMessage="Delete this assignment?"
              onConfirm={onDelete}
              aria-label="Delete assignment"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </ConfirmButton>
          </div>
        </div>
        {assignment.notes ? (
          <p className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-400">
            {assignment.notes}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
