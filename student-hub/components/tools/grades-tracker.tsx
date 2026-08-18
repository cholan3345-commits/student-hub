"use client"

import { useMemo, useState, type FormEvent } from "react"
import { ChartColumnBig, Pencil, Plus, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmButton } from "@/components/ui/confirm-button"
import { EmptyState } from "@/components/ui/empty-state"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import type { GradeSubject } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useGrades, type GradeSubjectInput } from "@/hooks/use-grades"

const emptySubject: GradeSubjectInput = {
  finalGrade: 0,
  midtermGrade: 0,
  overallGrade: 0,
  subjectName: "",
  units: 3,
}

export function GradesTracker() {
  const { addSubject, deleteSubject, subjects, updateSubject } = useGrades()
  const { toast } = useToast()
  const [draft, setDraft] = useState<GradeSubjectInput>(emptySubject)
  const [editingId, setEditingId] = useState<string | null>(null)

  const stats = useMemo(() => {
    const totalUnits = subjects.reduce((sum, subject) => sum + subject.units, 0)
    const weighted =
      totalUnits > 0
        ? subjects.reduce((sum, subject) => sum + subject.overallGrade * subject.units, 0) /
          totalUnits
        : 0

    return {
      gpa: weighted ? (weighted / 25).toFixed(2) : "0.00",
      subjects: subjects.length,
      totalUnits,
      weightedAverage: weighted.toFixed(2),
    }
  }, [subjects])

  function resetForm() {
    setDraft(emptySubject)
    setEditingId(null)
  }

  function editSubject(subject: GradeSubject) {
    setEditingId(subject.id)
    setDraft({
      finalGrade: subject.finalGrade,
      midtermGrade: subject.midtermGrade,
      overallGrade: subject.overallGrade,
      subjectName: subject.subjectName,
      units: subject.units,
    })
  }

  function submitSubject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!draft.subjectName.trim()) {
      toast({
        message: "Add a subject name before saving.",
        title: "Subject required",
        tone: "error",
      })
      return
    }

    const nextDraft = normalizeSubject(draft)

    if (editingId) {
      updateSubject(editingId, nextDraft)
      toast({
        message: "Subject grades were updated.",
        title: "Grades saved",
        tone: "success",
      })
    } else {
      addSubject(nextDraft)
      toast({
        message: "A subject was added to the grade tracker.",
        title: "Subject added",
        tone: "success",
      })
    }

    resetForm()
  }

  return (
    <PageContainer>
      <PageHeader
        title="Grades"
        description="Review subject averages and GPA statistics."
      />

      <div className="grid gap-4 xl:grid-cols-[24rem_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Subject" : "Add Subject"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={submitSubject}>
              <Field label="Subject Name">
                <Input
                  value={draft.subjectName}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      subjectName: event.target.value,
                    }))
                  }
                  placeholder="Physics"
                />
              </Field>
              <Field label="Units">
                <Input
                  type="number"
                  min={1}
                  value={draft.units}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      units: Number(event.target.value) || 1,
                    }))
                  }
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Midterm Grade">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={draft.midtermGrade}
                    onChange={(event) =>
                      setDraft((current) =>
                        normalizeSubject({
                          ...current,
                          midtermGrade: Number(event.target.value) || 0,
                        })
                      )
                    }
                  />
                </Field>
                <Field label="Final Grade">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={draft.finalGrade}
                    onChange={(event) =>
                      setDraft((current) =>
                        normalizeSubject({
                          ...current,
                          finalGrade: Number(event.target.value) || 0,
                        })
                      )
                    }
                  />
                </Field>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <p className="text-sm text-zinc-500">Overall Grade</p>
                <p className="mt-1 text-3xl font-semibold text-zinc-50">
                  {normalizeSubject(draft).overallGrade.toFixed(2)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="submit"
                  className="h-10 rounded-xl px-4"
                >
                  <Plus className="size-4" aria-hidden="true" />
                  {editingId ? "Save Changes" : "Add Subject"}
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
          <div className="grid gap-3 md:grid-cols-4">
            <StatCard label="Subjects" value={stats.subjects} />
            <StatCard label="Total Units" value={stats.totalUnits} />
            <StatCard label="Weighted Avg" value={stats.weightedAverage} />
            <StatCard label="GPA" value={stats.gpa} />
          </div>

          {subjects.length === 0 ? (
            <EmptyState
              icon={ChartColumnBig}
              title="No grades yet"
              description="Add subjects to compute averages and GPA statistics."
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {subjects.map((subject) => (
                <Card
                  key={subject.id}
                  className="transition-[transform,border-color,background-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-[var(--hub-accent-border)]"
                >
                  <CardContent className="pt-4 sm:pt-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="break-words text-base font-semibold text-zinc-50">
                          {subject.subjectName}
                        </h3>
                        <p className="mt-1 text-sm text-zinc-500">
                          {subject.units} unit{subject.units === 1 ? "" : "s"}
                        </p>
                      </div>
                      <Badge tone={subject.overallGrade >= 75 ? "green" : "red"}>
                        {subject.overallGrade.toFixed(2)}
                      </Badge>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-zinc-400">
                      <GradeRow label="Midterm" value={subject.midtermGrade} />
                      <GradeRow label="Final" value={subject.finalGrade} />
                    </div>
                    <div className="mt-4 flex gap-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-lg"
                        onClick={() => editSubject(subject)}
                        aria-label="Edit subject"
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                      </Button>
                      <ConfirmButton
                        type="button"
                        variant="destructive"
                        size="icon-lg"
                        confirmMessage="Delete this subject?"
                        onConfirm={() => {
                          deleteSubject(subject.id)
                          toast({
                            message: "The subject was deleted.",
                            title: "Subject deleted",
                            tone: "info",
                          })
                        }}
                        aria-label="Delete subject"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </ConfirmButton>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}

function normalizeSubject(subject: GradeSubjectInput): GradeSubjectInput {
  const midtermGrade = clampGrade(subject.midtermGrade)
  const finalGrade = clampGrade(subject.finalGrade)

  return {
    ...subject,
    finalGrade,
    midtermGrade,
    overallGrade: (midtermGrade + finalGrade) / 2,
    units: Math.max(1, Number(subject.units) || 1),
  }
}

function clampGrade(value: number) {
  return Math.min(100, Math.max(0, Number(value) || 0))
}

function GradeRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span>{label}</span>
      <span className={cn("font-medium", value >= 75 ? "text-emerald-200" : "text-red-200")}>
        {value.toFixed(2)}
      </span>
    </div>
  )
}

function StatCard({ label, value }: { label: number | string; value: number | string }) {
  return (
    <Card>
      <CardContent className="pt-4 sm:pt-5">
        <p className="text-sm text-zinc-500">{label}</p>
        <p className="mt-2 break-words text-2xl font-semibold text-zinc-50 sm:text-3xl">{value}</p>
      </CardContent>
    </Card>
  )
}
