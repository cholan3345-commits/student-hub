import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type FieldProps = {
  children: ReactNode
  className?: string
  hint?: string
  label: string
}

export function Field({ children, className, hint, label }: FieldProps) {
  return (
    <label className={cn("grid gap-2 text-sm font-medium text-zinc-200", className)}>
      <span>{label}</span>
      {children}
      {hint ? <span className="text-xs font-normal text-zinc-500">{hint}</span> : null}
    </label>
  )
}

