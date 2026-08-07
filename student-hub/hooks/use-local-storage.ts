"use client"

import { useCallback, useMemo, useState, useSyncExternalStore } from "react"

import {
  removeStorageValue,
  readStorageValue,
  STUDENT_HUB_STORAGE_EVENT,
  writeStorageValue,
} from "@/lib/storage"

type SetValue<T> = T | ((previous: T) => T)

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [initialStoredValue] = useState(initialValue)
  const [initialSnapshot] = useState(() => JSON.stringify(initialValue))

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      function syncValue(event: Event) {
        if (event instanceof StorageEvent && event.key !== key) {
          return
        }

        if (event instanceof CustomEvent && event.detail?.key && event.detail.key !== key) {
          return
        }

        onStoreChange()
      }

      window.addEventListener("storage", syncValue)
      window.addEventListener(STUDENT_HUB_STORAGE_EVENT, syncValue)

      return () => {
        window.removeEventListener("storage", syncValue)
        window.removeEventListener(STUDENT_HUB_STORAGE_EVENT, syncValue)
      }
    },
    [key]
  )

  const getSnapshot = useCallback(() => {
    return window.localStorage.getItem(key) ?? initialSnapshot
  }, [initialSnapshot, key])

  const getServerSnapshot = useCallback(() => initialSnapshot, [initialSnapshot])

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const storedValue = useMemo(() => {
    try {
      return JSON.parse(snapshot) as T
    } catch {
      return initialStoredValue
    }
  }, [initialStoredValue, snapshot])

  const setValue = useCallback(
    (value: SetValue<T>) => {
      const previous = readStorageValue(key, initialStoredValue)
      const nextValue = value instanceof Function ? value(previous) : value
      writeStorageValue(key, nextValue)
    },
    [initialStoredValue, key]
  )

  const removeValue = useCallback(() => {
    removeStorageValue(key)
  }, [key])

  return [storedValue, setValue, removeValue, true] as const
}
