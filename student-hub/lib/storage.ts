"use client"

import { ALL_STORAGE_KEYS, type StudentHubBackup } from "@/lib/types"

export const STUDENT_HUB_STORAGE_EVENT = "student-hub:storage"

export function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
}

export function dispatchStorageChange(key?: string) {
  window.dispatchEvent(
    new CustomEvent(STUDENT_HUB_STORAGE_EVENT, {
      detail: { key },
    })
  )
}

export function readStorageValue<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback
  }

  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeStorageValue<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value))
  dispatchStorageChange(key)
}

export function removeStorageValue(key: string) {
  window.localStorage.removeItem(key)
  dispatchStorageChange(key)
}

export function exportStudentHubData(): StudentHubBackup {
  const data: StudentHubBackup["data"] = {}

  ALL_STORAGE_KEYS.forEach((key) => {
    const raw = window.localStorage.getItem(key)

    if (raw) {
      try {
        data[key] = JSON.parse(raw)
      } catch {
        data[key] = raw
      }
    }
  })

  return {
    data,
    exportedAt: new Date().toISOString(),
    version: 1,
  }
}

export function importStudentHubData(backup: StudentHubBackup) {
  ALL_STORAGE_KEYS.forEach((key) => {
    const value = backup.data[key]

    if (value === undefined) {
      return
    }

    window.localStorage.setItem(key, JSON.stringify(value))
    dispatchStorageChange(key)
  })
}

export function resetStudentHubData() {
  ALL_STORAGE_KEYS.forEach((key) => {
    window.localStorage.removeItem(key)
    dispatchStorageChange(key)
  })
}

export function downloadJson(filename: string, value: unknown) {
  const blob = new Blob([JSON.stringify(value, null, 2)], {
    type: "application/json",
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

