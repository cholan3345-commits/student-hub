"use client"

import { useState, type FormEvent } from "react"
import { CheckCircle2, FileQuestion, Plus } from "lucide-react"

import { LoadingDots } from "@/components/ai/ai-common"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { useToast } from "@/components/ui/toast"
import {
  generateQuiz,
  type AiDifficulty,
  type AiQuestionType,
  type AiQuiz,
  type AiQuizQuestion,
} from "@/lib/ai"

const questionTypes: AiQuestionType[] = [
  "Multiple Choice",
  "True or False",
  "Identification",
]

export function AiQuizGenerator() {
  const { toast } = useToast()
  const [topic, setTopic] = useState("")
  const [questionCount, setQuestionCount] = useState(6)
  const [difficulty, setDifficulty] = useState<AiDifficulty>("Medium")
  const [selectedTypes, setSelectedTypes] = useState<AiQuestionType[]>([
    "Multiple Choice",
    "True or False",
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [quiz, setQuiz] = useState<AiQuiz | null>(null)

  async function submitQuiz(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!topic.trim()) {
      toast({
        message: "Add a topic before generating a quiz.",
        title: "Topic required",
        tone: "error",
      })
      return
    }

    if (selectedTypes.length === 0) {
      toast({
        message: "Select at least one question type.",
        title: "Question type required",
        tone: "error",
      })
      return
    }

    setIsLoading(true)

    try {
      setQuiz(
        await generateQuiz({
          difficulty,
          questionCount,
          questionTypes: selectedTypes,
          topic,
        })
      )
    } catch {
      toast({
        message: "The mock quiz service could not finish.",
        title: "Quiz error",
        tone: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function toggleType(type: AiQuestionType) {
    setSelectedTypes((current) =>
      current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type]
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title="AI Quiz Generator"
        description="Create practice questions from any topic with selectable difficulty and question types."
      />

      <div className="grid gap-4 xl:grid-cols-[24rem_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Setup</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={submitQuiz}>
              <Field label="Topic">
                <Input
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  placeholder="Cell biology, calculus, Philippine history"
                />
              </Field>
              <Field label="Question Count">
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={questionCount}
                  onChange={(event) => setQuestionCount(Number(event.target.value) || 1)}
                />
              </Field>
              <Field label="Difficulty">
                <Select
                  value={difficulty}
                  onChange={(event) => setDifficulty(event.target.value as AiDifficulty)}
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </Select>
              </Field>
              <Field label="Question Types">
                <div className="grid gap-2">
                  {questionTypes.map((type) => (
                    <label
                      key={type}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-zinc-200"
                    >
                      <span>{type}</span>
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type)}
                        onChange={() => toggleType(type)}
                        className="size-4 accent-[var(--hub-accent)]"
                      />
                    </label>
                  ))}
                </div>
              </Field>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-10 rounded-xl px-4"
              >
                <Plus className="size-4" aria-hidden="true" />
                Generate Quiz
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid content-start gap-4">
          {isLoading ? (
            <Card>
              <CardContent className="pt-4 sm:pt-5">
                <LoadingDots label="Building quiz" />
              </CardContent>
            </Card>
          ) : null}

          {!quiz && !isLoading ? (
            <EmptyState
              icon={FileQuestion}
              title="No quiz generated"
              description="Set a topic and question preferences to create practice items."
            />
          ) : null}

          {quiz ? (
            <div className="grid gap-3">
              <Card>
                <CardContent className="flex flex-wrap items-center gap-2 pt-4 sm:pt-5">
                  <Badge tone="blue">{quiz.topic}</Badge>
                  <Badge tone="zinc">{quiz.difficulty}</Badge>
                  <Badge tone="green">{quiz.questions.length} questions</Badge>
                </CardContent>
              </Card>
              {quiz.questions.map((question, index) => (
                <QuizQuestionCard
                  key={question.id}
                  index={index}
                  question={question}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </PageContainer>
  )
}

function QuizQuestionCard({
  index,
  question,
}: {
  index: number
  question: AiQuizQuestion
}) {
  return (
    <Card className="transition-[transform,border-color,background-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-[var(--hub-accent-border)]">
      <CardContent className="pt-4 sm:pt-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <Badge tone="blue">Question {index + 1}</Badge>
            <h3 className="mt-3 break-words text-base font-semibold text-zinc-50">
              {question.prompt}
            </h3>
          </div>
          <Badge>{question.type}</Badge>
        </div>
        {question.options.length > 0 ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {question.options.map((option) => (
              <div
                key={option}
                className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-sm text-zinc-300"
              >
                {option}
              </div>
            ))}
          </div>
        ) : null}
        <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3">
          <p className="flex items-center gap-2 text-sm font-medium text-emerald-100">
            <CheckCircle2 className="size-4" aria-hidden="true" />
            {question.answer}
          </p>
          <p className="mt-2 break-words text-sm leading-6 text-emerald-100/75">
            {question.explanation}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
