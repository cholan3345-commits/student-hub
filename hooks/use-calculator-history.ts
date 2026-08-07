"use client"

import { createId } from "@/lib/storage"
import { STORAGE_KEYS, type CalculatorHistoryItem } from "@/lib/types"
import { useLocalStorage } from "@/hooks/use-local-storage"

export function useCalculatorHistory() {
  const [history, setHistory, clearHistory, isReady] = useLocalStorage<
    CalculatorHistoryItem[]
  >(STORAGE_KEYS.calculatorHistory, [])

  function addHistory(expression: string, result: string) {
    const item: CalculatorHistoryItem = {
      createdAt: new Date().toISOString(),
      expression,
      id: createId(),
      result,
    }

    setHistory((current) => [item, ...current].slice(0, 30))
  }

  return {
    addHistory,
    clearHistory,
    history,
    isReady,
  }
}

