import { MainLayout } from "@/components/layout/main-layout"
import { PomodoroTimer } from "@/components/tools/pomodoro-timer"

export default function StudyTimerPage() {
  return (
    <MainLayout>
      <PomodoroTimer />
    </MainLayout>
  )
}
