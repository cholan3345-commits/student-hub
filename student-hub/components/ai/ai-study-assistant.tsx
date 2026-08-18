"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import {
  Bot,
  Brain,
  CalendarCheck,
  ClipboardList,
  Code2,
  FileQuestion,
  Layers,
  Send,
  Sigma,
  Sparkles,
  Trash2,
  Wand2,
  type LucideIcon,
} from "lucide-react"

import { CopyTextButton, LoadingDots } from "@/components/ai/ai-common"
import { MarkdownRenderer } from "@/components/ai/markdown-renderer"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/toast"
import { useLocalStorage } from "@/hooks/use-local-storage"
import {
  sendMessage,
  type AiAssistantActionId,
  type AiChatMessage,
} from "@/lib/ai"
import { createId } from "@/lib/storage"
import { STORAGE_KEYS } from "@/lib/types"
import { cn } from "@/lib/utils"

type QuickAiAction = {
  helper: string
  icon: LucideIcon
  id: AiAssistantActionId
  label: string
  prompt: string
}

const quickActions: QuickAiAction[] = [
  {
    helper: "Break down a topic",
    icon: Brain,
    id: "explain-topic",
    label: "Explain Topic",
    prompt: "Explain this topic clearly with examples: ",
  },
  {
    helper: "Compress class notes",
    icon: ClipboardList,
    id: "summarize-notes",
    label: "Summarize Notes",
    prompt: "Summarize these notes into key ideas: ",
  },
  {
    helper: "Practice questions",
    icon: FileQuestion,
    id: "generate-quiz",
    label: "Generate Quiz",
    prompt: "Generate a quick quiz about: ",
  },
  {
    helper: "Recall cards",
    icon: Layers,
    id: "generate-flashcards",
    label: "Generate Flashcards",
    prompt: "Generate flashcards for: ",
  },
  {
    helper: "Plan review time",
    icon: CalendarCheck,
    id: "create-study-plan",
    label: "Create Study Plan",
    prompt: "Create a study plan for these subjects and dates: ",
  },
  {
    helper: "Improve wording",
    icon: Wand2,
    id: "rewrite-notes",
    label: "Rewrite Notes",
    prompt: "Rewrite these notes more clearly: ",
  },
  {
    helper: "Debug and explain code",
    icon: Code2,
    id: "programming-helper",
    label: "Programming Helper",
    prompt: "Help me understand or fix this programming problem: ",
  },
  {
    helper: "Show solution steps",
    icon: Sigma,
    id: "math-solver",
    label: "Math Solver",
    prompt: "Solve this math problem step by step: ",
  },
]

export function AiStudyAssistant() {
  const { toast } = useToast()
  const [messages, setMessages] = useLocalStorage<AiChatMessage[]>(
    STORAGE_KEYS.aiChatHistory,
    []
  )
  const [draft, setDraft] = useState("")
  const [activeAction, setActiveAction] = useState<AiAssistantActionId | null>(null)
  const [isThinking, setIsThinking] = useState(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      behavior: "smooth",
      top: scrollRef.current.scrollHeight,
    })
  }, [isThinking, messages])

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const content = draft.trim()

    if (!content) {
      toast({
        message: "Write a question or choose a quick action first.",
        title: "Message required",
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
    const nextMessages = [...messages, userMessage]

    setMessages(nextMessages)
    setDraft("")
    setIsThinking(true)

    try {
      const response = await sendMessage({
        action: activeAction ?? undefined,
        messages: nextMessages,
        prompt: content,
      })
      const assistantMessage: AiChatMessage = {
        content: response,
        createdAt: new Date().toISOString(),
        id: createId(),
        role: "assistant",
      }

      setMessages((current) => [...current, assistantMessage])
    } catch {
      toast({
        message: "The mock AI service could not answer just now.",
        title: "AI unavailable",
        tone: "error",
      })
    } finally {
      setActiveAction(null)
      setIsThinking(false)
    }
  }

  function chooseAction(action: QuickAiAction) {
    setActiveAction(action.id)
    setDraft((current) => current || action.prompt)
  }

  function clearConversation() {
    setMessages([])
    setActiveAction(null)
    setDraft("")
    toast({
      message: "The AI chat history was cleared.",
      title: "Conversation cleared",
      tone: "info",
    })
  }

  return (
    <PageContainer>
      <PageHeader
        title="AI Study Assistant"
        description="Chat with a mock AI workspace for explanations, practice, planning, code help, and math steps."
      />

      <div className="grid gap-4 xl:grid-cols-[22rem_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Quick AI Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon

              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => chooseAction(action)}
                  className={cn(
                    "hub-glass-control flex min-h-14 items-center gap-3 rounded-xl px-3 py-2 text-left transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-[var(--hub-accent-border)] hover:bg-[var(--hub-accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hub-accent-ring)]",
                    activeAction === action.id &&
                      "border-[var(--hub-accent-border)] bg-[var(--hub-accent-soft)]"
                  )}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[var(--hub-accent-border)] bg-[var(--hub-accent-soft)] text-[var(--hub-accent)]">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block break-words text-sm font-medium text-zinc-100">
                      {action.label}
                    </span>
                    <span className="block break-words text-xs leading-5 text-zinc-500">
                      {action.helper}
                    </span>
                  </span>
                </button>
              )
            })}
          </CardContent>
        </Card>

        <Card className="hub-glass-strong min-h-[34rem]">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <CardTitle>Chat</CardTitle>
                <p className="mt-1 text-sm text-zinc-500">
                  {messages.length} message{messages.length === 1 ? "" : "s"} saved locally
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeAction ? (
                  <Badge tone="blue">
                    {quickActions.find((action) => action.id === activeAction)?.label}
                  </Badge>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={clearConversation}
                  className="h-10 rounded-xl border border-white/10 bg-white/[0.04] text-zinc-100"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Clear
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex min-h-[28rem] flex-col gap-4">
            <div
              ref={scrollRef}
              className="min-h-[18rem] flex-1 space-y-4 overflow-y-auto pr-1"
              aria-live="polite"
            >
              {messages.length === 0 ? (
                <EmptyState
                  icon={Sparkles}
                  title="Start a study chat"
                  description="Ask a question or choose one of the quick actions to generate a mock AI response."
                  className="min-h-[18rem]"
                />
              ) : (
                messages.map((message) => <ChatBubble key={message.id} message={message} />)
              )}

              {isThinking ? (
                <div className="flex justify-start">
                  <div className="hub-glass-control max-w-full rounded-2xl p-4">
                    <LoadingDots label="Assistant is typing" />
                  </div>
                </div>
              ) : null}
            </div>

            <form className="grid gap-3" onSubmit={handleSend}>
              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ask for an explanation, summary, quiz, code help, or math steps."
                className="min-h-24"
              />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-zinc-500">
                  {draft.length} characters ready
                </p>
                <Button
                  type="submit"
                  disabled={isThinking}
                  className="h-10 rounded-xl px-4"
                >
                  <Send className="size-4" aria-hidden="true" />
                  Send
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}

function ChatBubble({ message }: { message: AiChatMessage }) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[min(44rem,100%)] rounded-2xl border p-4",
          isUser
            ? "border-[var(--hub-accent-border)] bg-[var(--hub-accent-soft)] text-[var(--hub-text)]"
            : "hub-glass-control text-zinc-100"
        )}
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-xs font-medium uppercase text-zinc-500">
            {isUser ? <Brain className="size-3.5" /> : <Bot className="size-3.5" />}
            {isUser ? "You" : "Assistant"}
          </span>
          <CopyTextButton text={message.content} className="size-7" />
        </div>
        {isUser ? (
          <p className="whitespace-pre-wrap break-words text-sm leading-6">
            {message.content}
          </p>
        ) : (
          <MarkdownRenderer content={message.content} />
        )}
      </div>
    </div>
  )
}
