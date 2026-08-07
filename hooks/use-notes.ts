"use client"

import { createId } from "@/lib/storage"
import { STORAGE_KEYS, type Note } from "@/lib/types"
import { useLocalStorage } from "@/hooks/use-local-storage"

export type NoteInput = Omit<Note, "createdAt" | "id" | "updatedAt">

export function useNotes() {
  const [notes, setNotes, clearNotes, isReady] = useLocalStorage<Note[]>(
    STORAGE_KEYS.notes,
    []
  )

  function addNote(input: NoteInput) {
    const now = new Date().toISOString()
    const note: Note = {
      ...input,
      createdAt: now,
      id: createId(),
      updatedAt: now,
    }

    setNotes((current) => [note, ...current])
    return note
  }

  function updateNote(id: string, updates: Partial<NoteInput>) {
    setNotes((current) =>
      current.map((note) =>
        note.id === id
          ? { ...note, ...updates, updatedAt: new Date().toISOString() }
          : note
      )
    )
  }

  function deleteNote(id: string) {
    setNotes((current) => current.filter((note) => note.id !== id))
  }

  function toggleFavorite(id: string) {
    const note = notes.find((item) => item.id === id)

    if (note) {
      updateNote(id, { favorite: !note.favorite })
    }
  }

  function togglePinned(id: string) {
    const note = notes.find((item) => item.id === id)

    if (note) {
      updateNote(id, { pinned: !note.pinned })
    }
  }

  return {
    addNote,
    clearNotes,
    deleteNote,
    isReady,
    notes,
    toggleFavorite,
    togglePinned,
    updateNote,
  }
}

