"use client"

import { useRef, useState, type FormEvent } from "react"
import { FileText, MessageSquare, Send, Upload } from "lucide-react"

import { LoadingDots, MarkdownResult } from "@/components/ai/ai-common"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Field } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/toast"
import { analyzePDF, type AiChatMessage, type AiPdfAnalysis } from "@/lib/ai"
import { createId } from "@/lib/storage"

export function AiPdfAssistant() {
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [question, setQuestion] = useState("")
  const [analysis, setAnalysis] = useState<AiPdfAnalysis | null>(null)
  const [messages, setMessages] = useState<AiChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  async function handleFile(nextFile: File | undefined) {
    if (!nextFile) {
      return
    }

    if (nextFile.type && nextFile.type !== "application/pdf") {
      toast({
        message: "Choose a PDF file for the PDF assistant.",
        title: "PDF required",
        tone: "error",
      })
      return
    }

    setFile(nextFile)
    setIsLoading(true)

    try {
      const nextAnalysis = await analyzePDF({ fileName: nextFile.name })

      setAnalysis(nextAnalysis)
      setMessages([
        {
          content: nextAnalysis.summary,
          createdAt: new Date().toISOString(),
          id: createId(),
          role: "assistant",
        },
      ])
    } catch {
      toast({
        message: "The mock PDF assistant could not inspect the file.",
        title: "PDF error",
        tone: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function askQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!file) {
      toast({
        message: "Upload a PDF before asking a question.",
        title: "PDF required",
        tone: "error",
      })
      return
    }

    const content = question.trim()

    if (!content) {
      toast({
        message: "Write a question about the PDF.",
        title: "Question required",
        tone: "error",
      })
      return
    }

    const userMessage: AiChatMessage = {
      content,
      createdAt: new Date().toISOString(),
      id: createId(),
      role: "user",
    }

    setMessages((current) => [...current, userMessage])
    setQuestion("")
    setIsLoading(true)

    try {
      const nextAnalysis = await analyzePDF({ fileName: file.name, question: content })
      const assistantMessage: AiChatMessage = {
        content: nextAnalysis.answer,
        createdAt: new Date().toISOString(),
        id: createId(),
        role: "assistant",
      }

      setAnalysis(nextAnalysis)
      setMessages((current) => [...current, assistantMessage])
    } catch {
      toast({
        message: "The mock PDF assistant could not answer.",
        title: "PDF chat error",
        tone: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="AI PDF Assistant"
        description="Upload a PDF, preview its study status, summarize it, and ask document questions."
      />

      <div className="grid gap-4 xl:grid-cols-[24rem_1fr]">
        <div className="grid content-start gap-4">
          <Card>
            <CardHeader>
              <CardTitle>PDF Upload</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--hub-accent-border)] bg-[var(--hub-accent-soft)] p-6 text-center transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-[var(--hub-accent-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hub-accent-ring)]"
              >
                <Upload className="size-8 text-[var(--hub-accent)]" aria-hidden="true" />
                <span className="mt-3 text-sm font-medium text-zinc-100">
                  {file ? file.name : "Upload PDF"}
                </span>
                <span className="mt-1 text-xs text-zinc-500">
                  {file ? formatFileSize(file.size) : "PDF files only"}
                </span>
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(event) => handleFile(event.target.files?.[0])}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>PDF Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {file ? (
                <div className="hub-glass-control rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--hub-accent-border)] bg-[var(--hub-accent-soft)] text-[var(--hub-accent)]">
                      <FileText className="size-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="break-words text-sm font-medium text-zinc-100">
                        {file.name}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={FileText}
                  title="No PDF selected"
                  description="The selected document preview will appear here."
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid content-start gap-4">
          {isLoading ? (
            <Card>
              <CardContent className="pt-4 sm:pt-5">
                <LoadingDots label="Reading PDF" />
              </CardContent>
            </Card>
          ) : null}

          {analysis ? (
            <MarkdownResult
              title="Summary"
              content={`## Summary\n\n${analysis.summary}\n\n## Key Points\n\n${analysis.keyPoints
                .map((point) => `- ${point}`)
                .join("\n")}`}
            />
          ) : null}

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle>Question Area</CardTitle>
                {file ? <Badge tone="blue">{file.name}</Badge> : null}
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              {analysis?.suggestedQuestions.length ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.suggestedQuestions.map((item) => (
                    <Button
                      key={item}
                      type="button"
                      variant="ghost"
                      onClick={() => setQuestion(item)}
                      className="min-h-9 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-zinc-100"
                    >
                      {item}
                    </Button>
                  ))}
                </div>
              ) : null}
              <form className="grid gap-3" onSubmit={askQuestion}>
                <Field label="Ask About This PDF">
                  <Textarea
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    placeholder="What should I review first?"
                    className="min-h-24"
                  />
                </Field>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-10 rounded-xl px-4 sm:w-fit"
                >
                  <Send className="size-4" aria-hidden="true" />
                  Ask
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>PDF Chat</CardTitle>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  title="No PDF chat yet"
                  description="Upload a PDF and ask a question to start a document chat."
                />
              ) : (
                <div className="grid gap-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={
                        message.role === "user"
                          ? "justify-self-end rounded-2xl border border-[var(--hub-accent-border)] bg-[var(--hub-accent-soft)] p-3 text-sm leading-6 text-[var(--hub-text)]"
                          : "hub-glass-control justify-self-start rounded-2xl p-3 text-sm leading-6 text-zinc-300"
                      }
                    >
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}
