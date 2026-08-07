"use client"

import { createId } from "@/lib/storage"
import { STORAGE_KEYS, type StoredFile } from "@/lib/types"
import { useLocalStorage } from "@/hooks/use-local-storage"

export type StoredFileInput = Omit<StoredFile, "createdAt" | "id" | "updatedAt">

export function useFiles() {
  const [files, setFiles, clearFiles, isReady] = useLocalStorage<StoredFile[]>(
    STORAGE_KEYS.files,
    []
  )

  function addFile(input: StoredFileInput) {
    const now = new Date().toISOString()
    const file: StoredFile = {
      ...input,
      createdAt: now,
      id: createId(),
      updatedAt: now,
    }

    setFiles((current) => [file, ...current])
    return file
  }

  function updateFile(id: string, updates: Partial<StoredFileInput>) {
    setFiles((current) =>
      current.map((file) =>
        file.id === id
          ? { ...file, ...updates, updatedAt: new Date().toISOString() }
          : file
      )
    )
  }

  function deleteFile(id: string) {
    setFiles((current) => current.filter((file) => file.id !== id))
  }

  return {
    addFile,
    clearFiles,
    deleteFile,
    files,
    isReady,
    updateFile,
  }
}

