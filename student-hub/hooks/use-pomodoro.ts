"use client"

import { useEffect, useMemo, useState } from "react"

import { STORAGE_KEYS, type PomodoroMode, type PomodoroPreferences, type PomodoroState } from "@/lib/types"
import { useLocalStorage } from "@/hooks/use-local-storage"

export const defaultPomodoroPreferences: PomodoroPreferences = {
  focusMinutes: 25,
  longBreakMinutes: 15,
  notificationsEnabled: true,
  shortBreakMinutes: 5,
  soundEnabled: true,
}

export const defaultPomodoroState: PomodoroState = {
  endsAt: null,
  isRunning: false,
  mode: "focus",
  remainingSeconds: 25 * 60,
  sessionCount: 0,
}

export const pomodoroModeLabels: Record<PomodoroMode, string> = {
  focus: "Focus",
  "long-break": "Long Break",
  "short-break": "Short Break",
}

export function usePomodoro() {
  const [preferences, setPreferences] = useLocalStorage<PomodoroPreferences>(
    STORAGE_KEYS.pomodoroPreferences,
    defaultPomodoroPreferences
  )
  const [state, setState] = useLocalStorage<PomodoroState>(
    STORAGE_KEYS.pomodoroState,
    defaultPomodoroState
  )
  const [now, setNow] = useState(0)

  useEffect(() => {
    const tick = () => setNow(Date.now())
    const timeout = window.setTimeout(tick, 0)
    const interval = window.setInterval(tick, 1000)

    return () => {
      window.clearTimeout(timeout)
      window.clearInterval(interval)
    }
  }, [])

  const modeSeconds = useMemo(
    () => ({
      focus: preferences.focusMinutes * 60,
      "long-break": preferences.longBreakMinutes * 60,
      "short-break": preferences.shortBreakMinutes * 60,
    }),
    [
      preferences.focusMinutes,
      preferences.longBreakMinutes,
      preferences.shortBreakMinutes,
    ]
  )

  const remainingSeconds = Math.max(
    0,
    state.isRunning && state.endsAt
      ? Math.ceil(
          (state.endsAt -
            (now || state.endsAt - state.remainingSeconds * 1000)) /
            1000
        )
      : state.remainingSeconds
  )
  const totalSeconds = modeSeconds[state.mode]
  const progress = totalSeconds > 0 ? 1 - remainingSeconds / totalSeconds : 0

  useEffect(() => {
    if (!state.isRunning || !state.endsAt || remainingSeconds > 0) {
      return
    }

    if (preferences.notificationsEnabled && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("Pomodoro complete", {
          body: `${pomodoroModeLabels[state.mode]} session finished.`,
        })
      }
    }

    if (preferences.soundEnabled) {
      playTimerSound()
    }

    setState((current) => ({
      ...current,
      endsAt: null,
      isRunning: false,
      remainingSeconds: modeSeconds[current.mode],
      sessionCount:
        current.mode === "focus" ? current.sessionCount + 1 : current.sessionCount,
    }))
  }, [
    modeSeconds,
    preferences.notificationsEnabled,
    preferences.soundEnabled,
    remainingSeconds,
    setState,
    state.endsAt,
    state.isRunning,
    state.mode,
  ])

  function start() {
    if (preferences.notificationsEnabled && "Notification" in window) {
      Notification.requestPermission()
    }

    const seconds = remainingSeconds || modeSeconds[state.mode]

    setState((current) => ({
      ...current,
      endsAt: Date.now() + seconds * 1000,
      isRunning: true,
      remainingSeconds: seconds,
    }))
  }

  function pause() {
    setState((current) => ({
      ...current,
      endsAt: null,
      isRunning: false,
      remainingSeconds,
    }))
  }

  function reset() {
    setState((current) => ({
      ...current,
      endsAt: null,
      isRunning: false,
      remainingSeconds: modeSeconds[current.mode],
    }))
  }

  function setMode(mode: PomodoroMode) {
    setState((current) => ({
      ...current,
      endsAt: null,
      isRunning: false,
      mode,
      remainingSeconds: modeSeconds[mode],
    }))
  }

  function updatePreferences(updates: Partial<PomodoroPreferences>) {
    setPreferences((current) => ({ ...current, ...updates }))
  }

  function clearSessions() {
    setState((current) => ({ ...current, sessionCount: 0 }))
  }

  return {
    clearSessions,
    modeSeconds,
    pause,
    preferences,
    progress,
    remainingSeconds,
    reset,
    setMode,
    start,
    state,
    totalSeconds,
    updatePreferences,
  }
}

function playTimerSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext

  if (!AudioContextClass) {
    return
  }

  const context = new AudioContextClass()
  const oscillator = context.createOscillator()
  const gain = context.createGain()

  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.frequency.value = 880
  gain.gain.setValueAtTime(0.001, context.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.35)
  oscillator.start()
  oscillator.stop(context.currentTime + 0.36)
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}
