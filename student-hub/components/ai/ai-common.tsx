"use client"

import { Check, Copy, Loader2 } from "lucide-react"
import { useState, type ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MarkdownRenderer } from "@/components/ai/markdown-renderer"
import { cn } from "@/lib/utils"

export function LoadingDots({ label = "Generating" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-zinc-400">
      <Loader2 className="size-4 animate-spin text-[var(--hub-accent)]" aria-hidden="true" />
      {label}
      <span className="flex gap-1" aria-hidden="true">
        <span className="size-1 animate-pulse rounded-full bg-[var(--hub-accent)]" />
        <span className="size-1 animate-pulse rounded-full bg-[var(--hub-accent)] [animation-delay:120ms]" />
        <span className="size-1 animate-pulse rounded-full bg-[var(--hub-accent)] [animation-delay:240ms]" />
      </span>
    </span>
  )
}

export function CopyTextButton({
  className,
  text,
}: {
  className?: string
  text: string
}) {
  const [copied, setCopied] = useState(false)

  async function copyText() {
    await navigator.clipboard?.writeText(text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-lg"
      onClick={copyText}
      aria-label="Copy text"
      className={cn("text-zinc-400 hover:text-zinc-100", className)}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
    </Button>
  )
}

export function AiResultCard({
  action,
  children,
  className,
  title,
}: {
  action?: ReactNode
  children: ReactNode
  className?: string
  title: string
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle>{title}</CardTitle>
          {action}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export function MarkdownResult({
  content,
  title,
}: {
  content: string
  title: string
}) {
  return (
    <AiResultCard title={title} action={<CopyTextButton text={content} />}>
      <MarkdownRenderer content={content} />
    </AiResultCard>
  )
}
