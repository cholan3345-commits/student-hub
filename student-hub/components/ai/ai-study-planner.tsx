"use client"

import { useState, type FormEvent } from "react"
import { CalendarCheck, Clock, Plus } from "lucide-react"

import { LoadingDots } from "@/components/ai/ai-common"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/toast"
import { createStudyPlan, type AiStudyPlan } from "@/lib/ai"

export function AiStudyPlanner() {
  const { toast } = useToast()
  const [subjects, setSubjects] = useState("")
  const [examDates, setExamDates] = useState("")
  const [availableHours, setAvailableHours] = useState(6)
  const [isLoading, setIsLoading] = useState(false)
  const [plan, setPlan] = useState<AiStudyPlan | null>(null)

  async function submitPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!subjects.trim()) {
      toast({
        message: "Add at least one subject before creating a plan.",
        title: "Subjects required",
        tone: "error",
      })
      return
    }

    setIsLoading(true)

    try {
      setPlan(await createStudyPlan({ availableHours, examDates, subjects }))
    } catch {
      toast({
        message: "The mock study planner could not finish.",
        title: "Planner error",
        tone: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="AI Study Planner"
        description="Generate a visual study plan from subjects, exam dates, and available study hours."
      />

      <div className="grid gap-4 xl:grid-cols-[24rem_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Plan Inputs</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={submitPlan}>
              <Field label="Subjects" hint="Use commas or one subject per line.">
                <Textarea
                  value={subjects}
                  onChange={(event) => setSubjects(event.target.value)}
                  placeholder="Math, Biology, Literature"
                />
              </Field>
              <Field label="Exam Dates" hint="Add dates or deadline notes.">
                <Textarea
                  value={examDates}
                  onChange={(event) => setExamDates(event.target.value)}
                  placeholder={"Math - Aug 20\nBiology - Aug 24"}
                />
              </Field>
              <Field label="Available Study Hours">
                <Input
                  type="number"
                  min={1}
                  value={availableHours}
                  onChange={(event) => setAvailableHours(Number(event.target.value) || 1)}
                />
              </Field>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-10 rounded-xl px-4"
              >
                <Plus className="size-4" aria-hidden="true" />
                Create Study Plan
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid content-start gap-4">
          {isLoading ? (
            <Card>
              <CardContent className="pt-4 sm:pt-5">
                <LoadingDots label="Planning schedule" />
              </CardContent>
            </Card>
          ) : null}

          {!plan && !isLoading ? (
            <EmptyState
              icon={CalendarCheck}
              title="No plan generated"
              description="Add your subjects and study time to build a plan."
            />
          ) : null}

          {plan ? (
            <>
              <Card>
                <CardContent className="grid gap-3 pt-4 sm:pt-5">
                  <p className="break-words text-sm leading-6 text-zinc-400">
                    {plan.overview}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {plan.subjects.map((subject) => (
                      <Badge key={subject} tone="blue">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <div className="grid gap-3 lg:grid-cols-2">
                {plan.plan.map((day) => (
                  <Card
                    key={`${day.dateLabel}-${day.focus}`}
                    className="transition-[transform,border-color,background-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-[var(--hub-accent-border)]"
                  >
                    <CardContent className="pt-4 sm:pt-5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Badge tone="blue">{day.dateLabel}</Badge>
                        <span className="inline-flex items-center gap-2 text-sm text-zinc-500">
                          <Clock className="size-4 text-[var(--hub-accent)]" aria-hidden="true" />
                          {day.minutes} min
                        </span>
                      </div>
                      <h3 className="mt-3 break-words text-lg font-semibold text-zinc-50">
                        {day.focus}
                      </h3>
                      <ul className="mt-4 grid gap-2 pl-5 text-sm leading-6 text-zinc-400">
                        {day.tasks.map((task) => (
                          <li key={task} className="list-disc break-words">
                            {task}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </PageContainer>
  )
}
