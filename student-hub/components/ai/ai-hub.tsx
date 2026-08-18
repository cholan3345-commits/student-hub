import Link from "next/link"
import { ArrowUpRight, Sparkles } from "lucide-react"

import { aiToolItems } from "@/components/navigation"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"

export function AiHub() {
  return (
    <PageContainer>
      <PageHeader
        title="AI Hub"
        description="Choose the study tool that fits the work in front of you. Every existing AI workspace remains available here."
      />

      <section aria-label="AI study tools" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {aiToolItems.map((tool) => {
          const Icon = tool.icon

          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="hub-glass hub-focus group flex min-h-44 min-w-0 flex-col justify-between rounded-[1.4rem] p-5 transition-[transform,border-color,background-color,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:border-[var(--hub-accent-border)] hover:bg-white/[0.085] hover:shadow-2xl hover:shadow-[var(--hub-accent-glow)]"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="hub-accent-soft flex size-12 shrink-0 items-center justify-center rounded-2xl border transition-transform duration-200 ease-out group-hover:scale-105">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <ArrowUpRight
                  className="size-5 shrink-0 text-zinc-500 transition-[transform,color] duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--hub-accent)]"
                  aria-hidden="true"
                />
              </div>
              <div className="mt-5 grid min-w-0 gap-1.5">
                <h2 className="break-words text-base font-semibold text-[var(--hub-text)]">
                  {tool.title}
                </h2>
                <p className="break-words text-sm leading-6 text-[var(--hub-muted-text)]">
                  {tool.description}
                </p>
              </div>
            </Link>
          )
        })}
      </section>

      <div className="mt-4 flex items-center gap-2 text-xs text-[var(--hub-muted-text)]">
        <Sparkles className="size-3.5 text-[var(--hub-accent)]" aria-hidden="true" />
        AI work stays in the existing local Student Hub tools.
      </div>
    </PageContainer>
  )
}
