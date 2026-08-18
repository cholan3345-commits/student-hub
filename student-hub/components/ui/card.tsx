import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "hub-glass min-w-0 rounded-[1.4rem] text-[var(--hub-text)] transition-[transform,opacity,border-color,background-color,box-shadow] duration-200 ease-out",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("min-w-0 flex flex-col gap-1.5 p-4 sm:p-5", className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="card-title"
      className={cn(
        "min-w-0 break-words text-base font-semibold leading-snug tracking-normal text-[var(--hub-text)]",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn(
        "min-w-0 break-words text-sm leading-6 text-[var(--hub-muted-text)]",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("min-w-0 p-4 pt-0 sm:p-5 sm:pt-0", className)}
      {...props}
    />
  )
}

export { Card, CardContent, CardDescription, CardHeader, CardTitle }
