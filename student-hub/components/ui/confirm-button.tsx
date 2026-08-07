"use client"

import type { ComponentProps } from "react"

import { Button } from "@/components/ui/button"

type ConfirmButtonProps = Omit<ComponentProps<typeof Button>, "onClick"> & {
  confirmMessage: string
  onConfirm: () => void
}

export function ConfirmButton({
  confirmMessage,
  onConfirm,
  ...props
}: ConfirmButtonProps) {
  return (
    <Button
      {...props}
      onClick={() => {
        if (window.confirm(confirmMessage)) {
          onConfirm()
        }
      }}
    />
  )
}
