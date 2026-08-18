"use client"

import { useState } from "react"
import { BookOpen, FileText, ListChecks, Maximize2, Sparkles, Wand2 } from "lucide-react"

import { LoadingDots, MarkdownResult } from "@/components/ai/ai-common"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/toast"
import { summarizeText, type AiTextMode, type AiTextResult } from "@/lib/ai"
import { cn } from "@/lib/utils"

const noteActions: Array<{
  icon: typeof Sparkles
  label: string
  mode: AiTextMode
}> = [
  { icon: Sparkles, label: "Summarize", mode: "summarize" },
  { icon: Wand2, label: "Rewrite", mode: "rewrite" },
  { icon: BookOpen, label: "Simplify", mode: "simplify" },
  { icon: Maximize2, label: "Expand", mode: "expand" },
  { icon: ListChecks, label: "Key Points", mode: "key-points" },
  { icon: FileText, label: "Reviewer", mode: "reviewer" },
]

export function AiNotesPage() {
  const { toast } = useToast()
  const [notes, setNotes] = useState("")
  const [activeMode, setActiveMode] = useState<AiTextMode>("summarize")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AiTextResult | null>(null)

  async function runAction(mode = activeMode) {
    if (!notes.trim()) {
      toast({
        message: "Paste notes before running an AI notes action.",
        title: "Notes required",
        tone: "error",
      })
      return
    }

    setActiveMode(mode)
    setIsLoading(true)

    try {
      setResult(await summarizeText({ mode, text: notes }))
    } catch {
      toast({
        message: "The mock AI notes service could not finish.",
        title: "AI notes error",
        tone: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="AI Notes"
        description="Transform pasted notes into summaries, clearer wording, key points, and reviewers."
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,34rem)]">
        <Card>
          <CardHeader>
            <CardTitle>Notes Input</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Field label="Paste Notes">
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Paste lecture notes, reading notes, or rough study material."
                className="min-h-[22rem]"
              />
            </Field>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {noteActions.map((action) => {
                const Icon = action.icon

                return (
                  <Button
                    key={action.mode}
                    type="button"
                    variant={activeMode === action.mode ? "default" : "ghost"}
                    onClick={() => runAction(action.mode)}
                    disabled={isLoading}
                    className={cn(
                      "h-11 rounded-xl border border-white/10 px-3",
                      activeMode === action.mode
                        ? "hub-accent-bg"
                        : "hub-glass-control text-zinc-100"
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {action.label}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid content-start gap-4">
          <Card>
            <CardContent className="pt-4 sm:pt-5">
              {isLoading ? (
                <LoadingDots label="Working on notes" />
              ) : (
                <p className="text-sm leading-6 text-zinc-500">
                  Choose an action after pasting notes to generate a study-ready result.
                </p>
              )}
            </CardContent>
          </Card>

          {result ? <MarkdownResult title={result.title} content={result.content} /> : null}
        </div>
      </div>
    </PageContainer>
  )
}
