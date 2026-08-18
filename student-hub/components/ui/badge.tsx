import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type BadgeProps = {
  children: ReactNode
  className?: string
  tone?: "blue" | "green" | "red" | "yellow" | "zinc"
}

const tones: Record<NonNullable<BadgeProps["tone"]>, string> = {
  blue: "hub-accent-soft",
  green: "border-emerald-400/20 bg-emerald-500/10 text-emerald-200",
  red: "border-red-400/20 bg-red-500/10 text-red-200",
  yellow: "border-amber-400/20 bg-amber-500/10 text-amber-200",
  zinc: "border-white/10 bg-white/[0.04] text-zinc-300",
}

export function Badge({ children, className, tone = "zinc" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 max-w-full items-center gap-1.5 rounded-lg border px-2 py-0.5 text-xs font-medium leading-5",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  )
}
