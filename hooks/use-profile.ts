"use client"

import { STORAGE_KEYS, type StudentProfile } from "@/lib/types"
import { useLocalStorage } from "@/hooks/use-local-storage"

export const defaultProfile: StudentProfile = {
  avatar: "",
  course: "",
  email: "",
  name: "",
  school: "",
  studentId: "",
  yearLevel: "",
}

export function useProfile() {
  const [profile, setProfile, clearProfile, isReady] =
    useLocalStorage<StudentProfile>(STORAGE_KEYS.profile, defaultProfile)

  function updateProfile(updates: Partial<StudentProfile>) {
    setProfile((current) => ({ ...current, ...updates }))
  }

  return {
    clearProfile,
    isReady,
    profile,
    updateProfile,
  }
}

