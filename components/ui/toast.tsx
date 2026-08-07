"use client"

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"
import { CheckCircle2, Info, X, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { createId } from "@/lib/storage"

type ToastTone = "success" | "error" | "info"

type Toast = {
  id: string
  message: string
  tone: ToastTone
  title: string
}

type ToastContextValue = {
  toast: (toast: Omit<Toast, "id">) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const toast = useCallback(
    (nextToast: Omit<Toast, "id">) => {
      const id = createId()

      setToasts((current) => [{ ...nextToast, id }, ...current].slice(0, 4))
      window.setTimeout(() => removeToast(id), 3200)
    },
    [removeToast]
  )

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-[90] grid w-[min(22rem,calc(100vw-2rem))] gap-3"
      >
        {toasts.map((item) => (
          <ToastItem key={item.id} toast={item} onDismiss={() => removeToast(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider")
  }

  return context
}

function ToastItem({ onDismiss, toast }: { onDismiss: () => void; toast: Toast }) {
  const Icon = toast.tone === "success" ? CheckCircle2 : toast.tone === "error" ? XCircle : Info

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border bg-[#111827]/95 p-4 text-zinc-100 shadow-2xl shadow-black/30 backdrop-blur animate-in slide-in-from-right-3 fade-in duration-200",
        toast.tone === "success" && "border-emerald-400/25",
        toast.tone === "error" && "border-red-400/25",
        toast.tone === "info" && "border-blue-400/25"
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 size-5 shrink-0",
          toast.tone === "success" && "text-emerald-300",
          toast.tone === "error" && "text-red-300",
          toast.tone === "info" && "text-blue-300"
        )}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{toast.title}</p>
        <p className="mt-1 text-sm leading-5 text-zinc-400">{toast.message}</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Dismiss notification"
        onClick={onDismiss}
        className="text-zinc-500 hover:text-zinc-100"
      >
        <X className="size-4" aria-hidden="true" />
      </Button>
    </div>
  )
}

