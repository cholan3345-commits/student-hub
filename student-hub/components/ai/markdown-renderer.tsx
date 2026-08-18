"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type MarkdownRendererProps = {
  className?: string
  content: string
}

type MarkdownSegment =
  | {
      text: string
      type: "markdown"
    }
  | {
      code: string
      language: string
      type: "code"
    }

export function MarkdownRenderer({ className, content }: MarkdownRendererProps) {
  return (
    <div className={cn("min-w-0 space-y-4 text-sm leading-6 text-zinc-300", className)}>
      {parseSegments(content).map((segment, index) =>
        segment.type === "code" ? (
          <CodeBlock key={`${segment.type}-${index}`} code={segment.code} language={segment.language} />
        ) : (
          <MarkdownText key={`${segment.type}-${index}`} text={segment.text} />
        )
      )}
    </div>
  )
}

function MarkdownText({ text }: { text: string }) {
  const blocks = text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)

  return (
    <>
      {blocks.map((block, index) => (
        <MarkdownBlock key={index} block={block} />
      ))}
    </>
  )
}

function MarkdownBlock({ block }: { block: string }) {
  const lines = block.split("\n").map((line) => line.trim()).filter(Boolean)
  const heading = block.match(/^(#{1,3})\s+(.+)/)

  if (heading) {
    const level = heading[1].length
    const Tag = level === 1 ? "h2" : level === 2 ? "h3" : "h4"

    return (
      <Tag className="break-words text-base font-semibold leading-snug text-zinc-50">
        {renderInline(heading[2])}
      </Tag>
    )
  }

  if (lines.every((line) => /^[-*]\s+/.test(line))) {
    return (
      <ul className="grid gap-2 pl-5">
        {lines.map((line, index) => (
          <li key={index} className="list-disc break-words">
            {renderInline(line.replace(/^[-*]\s+/, ""))}
          </li>
        ))}
      </ul>
    )
  }

  if (lines.every((line) => /^\d+\.\s+/.test(line))) {
    return (
      <ol className="grid gap-2 pl-5">
        {lines.map((line, index) => (
          <li key={index} className="list-decimal break-words">
            {renderInline(line.replace(/^\d+\.\s+/, ""))}
          </li>
        ))}
      </ol>
    )
  }

  return <p className="break-words text-zinc-300">{renderInline(block)}</p>
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false)

  async function copyCode() {
    await navigator.clipboard?.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div className="hub-glass-control overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2">
        <span className="text-xs font-medium uppercase text-zinc-500">
          {language || "code"}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={copyCode}
          aria-label="Copy code block"
          className="text-zinc-400 hover:text-zinc-100"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </Button>
      </div>
      <pre className="max-w-full overflow-x-auto p-3 text-xs leading-6 text-[var(--hub-text)]">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function renderInline(text: string) {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="rounded-md border border-[var(--hub-accent-border)] bg-[var(--hub-accent-soft)] px-1.5 py-0.5 text-[0.8em] text-[var(--hub-text)]"
        >
          {part.slice(1, -1)}
        </code>
      )
    }

    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-zinc-100">
          {part.slice(2, -2)}
        </strong>
      )
    }

    return part
  })
}

function parseSegments(content: string): MarkdownSegment[] {
  const segments: MarkdownSegment[] = []
  const fencePattern = /```([\w-]*)\n?([\s\S]*?)```/g
  let lastIndex = 0
  let match: RegExpExecArray | null = fencePattern.exec(content)

  while (match) {
    if (match.index > lastIndex) {
      segments.push({ text: content.slice(lastIndex, match.index), type: "markdown" })
    }

    segments.push({
      code: match[2].trim(),
      language: match[1],
      type: "code",
    })
    lastIndex = fencePattern.lastIndex
    match = fencePattern.exec(content)
  }

  if (lastIndex < content.length) {
    segments.push({ text: content.slice(lastIndex), type: "markdown" })
  }

  return segments.length ? segments : [{ text: content, type: "markdown" }]
}
