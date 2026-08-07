"use client"

import { useEffect, useMemo, useState } from "react"
import { Calculator, Delete, RotateCcw, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmButton } from "@/components/ui/confirm-button"
import { EmptyState } from "@/components/ui/empty-state"
import { useToast } from "@/components/ui/toast"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { cn } from "@/lib/utils"
import { useCalculatorHistory } from "@/hooks/use-calculator-history"

const buttons = [
  "C",
  "±",
  "%",
  "DEL",
  "7",
  "8",
  "9",
  "÷",
  "4",
  "5",
  "6",
  "×",
  "1",
  "2",
  "3",
  "-",
  "0",
  ".",
  "=",
  "+",
]

export function CalculatorTool() {
  const { addHistory, clearHistory, history } = useCalculatorHistory()
  const { toast } = useToast()
  const [expression, setExpression] = useState("")

  const display = expression || "0"

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (/^\d$/.test(event.key)) {
        event.preventDefault()
        append(event.key)
        return
      }

      const keyMap: Record<string, string> = {
        "*": "×",
        "/": "÷",
        Backspace: "DEL",
        Enter: "=",
        Escape: "C",
      }

      if (["+", "-", ".", "%"].includes(event.key) || keyMap[event.key]) {
        event.preventDefault()
        handleButton(keyMap[event.key] ?? event.key)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  })

  function append(value: string) {
    setExpression((current) => appendToken(current, value))
  }

  function handleButton(value: string) {
    if (value === "C") {
      setExpression("")
      return
    }

    if (value === "DEL") {
      setExpression((current) => current.slice(0, -1))
      return
    }

    if (value === "±") {
      setExpression((current) =>
        current.startsWith("-") ? current.slice(1) : current ? `-${current}` : "0"
      )
      return
    }

    if (value === "%") {
      try {
        const result = evaluateExpression(expression || "0") / 100
        setExpression(formatResult(result))
      } catch {
        showError()
      }
      return
    }

    if (value === "=") {
      try {
        const result = evaluateExpression(expression || "0")
        const formatted = formatResult(result)
        addHistory(expression || "0", formatted)
        setExpression(formatted)
      } catch {
        showError()
      }
      return
    }

    append(value)
  }

  function showError() {
    toast({
      message: "The current expression cannot be calculated.",
      title: "Calculator error",
      tone: "error",
    })
  }

  const hasExpression = useMemo(() => expression.length > 0, [expression])

  return (
    <PageContainer>
      <PageHeader
        title="Calculator"
        description="Keep quick calculations close to your study flow."
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(18rem,26rem)_1fr]">
        <Card>
          <CardContent className="pt-5">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="mb-4 flex min-h-24 items-end justify-end overflow-hidden rounded-2xl border border-blue-400/20 bg-[#060913] p-4 text-right shadow-inner shadow-black">
                <p className="break-all text-4xl font-semibold text-blue-100">{display}</p>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {buttons.map((button) => {
                  const isOperator = ["÷", "×", "-", "+", "="].includes(button)
                  const isClear = button === "C" || button === "DEL"

                  return (
                    <Button
                      key={button}
                      type="button"
                      variant={isOperator ? "default" : "ghost"}
                      onClick={() => handleButton(button)}
                      aria-label={`Calculator ${button}`}
                      className={cn(
                        "h-14 rounded-xl text-base transition duration-200 hover:-translate-y-0.5",
                        isOperator &&
                          "bg-blue-500/85 text-white shadow-lg shadow-blue-950/25 hover:bg-blue-400",
                        isClear &&
                          "border border-red-400/15 bg-red-500/10 text-red-200 hover:bg-red-500/20",
                        !isOperator &&
                          !isClear &&
                          "border border-white/10 bg-white/[0.04] text-zinc-100 hover:bg-white/[0.08]"
                      )}
                    >
                      {button === "DEL" ? <Delete className="size-4" /> : button}
                    </Button>
                  )
                })}
              </div>
              <Button
                type="button"
                disabled={!hasExpression}
                onClick={() => setExpression("")}
                variant="ghost"
                className="mt-3 h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] text-zinc-100"
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                Clear Display
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle>Calculation History</CardTitle>
              {history.length > 0 ? (
                <ConfirmButton
                  type="button"
                  variant="destructive"
                  confirmMessage="Clear calculation history?"
                  onConfirm={() => {
                    clearHistory()
                    toast({
                      message: "Calculator history was cleared.",
                      title: "History cleared",
                      tone: "info",
                    })
                  }}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Clear
                </ConfirmButton>
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <EmptyState
                icon={Calculator}
                title="No calculations yet"
                description="Your recent calculations will appear here."
              />
            ) : (
              <div className="grid gap-3">
                {history.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setExpression(item.result)}
                    className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-400/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
                  >
                    <p className="break-all text-sm text-zinc-500">{item.expression}</p>
                    <p className="mt-2 break-all text-xl font-semibold text-zinc-50">
                      {item.result}
                    </p>
                    <p className="mt-2 text-xs text-zinc-600">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}

function appendToken(current: string, token: string) {
  const operators = ["+", "-", "×", "÷"]
  const previous = current.at(-1)

  if (operators.includes(token) && (!current || operators.includes(previous ?? ""))) {
    return current ? `${current.slice(0, -1)}${token}` : token === "-" ? "-" : current
  }

  if (token === "." && current.split(/[+\-×÷]/).at(-1)?.includes(".")) {
    return current
  }

  return `${current}${token}`
}

function evaluateExpression(expression: string) {
  const sanitized = expression.replaceAll("×", "*").replaceAll("÷", "/")

  if (!/^[\d+\-*/. ()]+$/.test(sanitized)) {
    throw new Error("Invalid expression")
  }

  const value = Function(`"use strict"; return (${sanitized})`)() as number

  if (!Number.isFinite(value)) {
    throw new Error("Invalid result")
  }

  return value
}

function formatResult(value: number) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(8)))
}

