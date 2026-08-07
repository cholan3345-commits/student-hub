"use client"

import { createId } from "@/lib/storage"
import { STORAGE_KEYS, type GradeSubject } from "@/lib/types"
import { useLocalStorage } from "@/hooks/use-local-storage"

export type GradeSubjectInput = Omit<GradeSubject, "createdAt" | "id" | "updatedAt">

export function useGrades() {
  const [subjects, setSubjects, clearGrades, isReady] = useLocalStorage<
    GradeSubject[]
  >(STORAGE_KEYS.grades, [])

  function addSubject(input: GradeSubjectInput) {
    const now = new Date().toISOString()
    const subject: GradeSubject = {
      ...input,
      createdAt: now,
      id: createId(),
      updatedAt: now,
    }

    setSubjects((current) => [...current, subject])
    return subject
  }

  function updateSubject(id: string, updates: Partial<GradeSubjectInput>) {
    setSubjects((current) =>
      current.map((subject) =>
        subject.id === id
          ? { ...subject, ...updates, updatedAt: new Date().toISOString() }
          : subject
      )
    )
  }

  function deleteSubject(id: string) {
    setSubjects((current) => current.filter((subject) => subject.id !== id))
  }

  return {
    addSubject,
    clearGrades,
    deleteSubject,
    isReady,
    subjects,
    updateSubject,
  }
}

