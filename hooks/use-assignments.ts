"use client"

import { createId } from "@/lib/storage"
import { STORAGE_KEYS, type Assignment } from "@/lib/types"
import { useLocalStorage } from "@/hooks/use-local-storage"

export type AssignmentInput = Omit<Assignment, "createdAt" | "id" | "updatedAt">

export function useAssignments() {
  const [assignments, setAssignments, clearAssignments, isReady] = useLocalStorage<
    Assignment[]
  >(STORAGE_KEYS.assignments, [])

  function addAssignment(input: AssignmentInput) {
    const now = new Date().toISOString()
    const item: Assignment = {
      ...input,
      createdAt: now,
      id: createId(),
      updatedAt: now,
    }

    setAssignments((current) => [...current, item])
    return item
  }

  function updateAssignment(id: string, updates: Partial<AssignmentInput>) {
    setAssignments((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, ...updates, updatedAt: new Date().toISOString() }
          : item
      )
    )
  }

  function deleteAssignment(id: string) {
    setAssignments((current) => current.filter((item) => item.id !== id))
  }

  function duplicateAssignment(id: string) {
    const source = assignments.find((item) => item.id === id)

    if (!source) {
      return null
    }

    return addAssignment({
      description: source.description,
      dueDate: source.dueDate,
      notes: source.notes,
      priority: source.priority,
      progress: source.progress,
      status: source.status,
      subject: source.subject,
      title: `${source.title} Copy`,
    })
  }

  function toggleAssignmentComplete(id: string) {
    const source = assignments.find((item) => item.id === id)

    if (!source) {
      return
    }

    updateAssignment(id, {
      progress: source.status === "Completed" ? 0 : 100,
      status: source.status === "Completed" ? "Not Started" : "Completed",
    })
  }

  return {
    addAssignment,
    assignments,
    clearAssignments,
    deleteAssignment,
    duplicateAssignment,
    isReady,
    toggleAssignmentComplete,
    updateAssignment,
  }
}

