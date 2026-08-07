"use client"

import { Camera, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { useProfile } from "@/hooks/use-profile"

export function ProfilePanel() {
  const { profile, updateProfile } = useProfile()
  const { toast } = useToast()
  const initials =
    profile.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "SH"

  function handleAvatar(file: File) {
    const reader = new FileReader()

    reader.onload = () => {
      updateProfile({ avatar: String(reader.result ?? "") })
      toast({
        message: "Your avatar was saved in this browser.",
        title: "Avatar updated",
        tone: "success",
      })
    }

    reader.readAsDataURL(file)
  }

  return (
    <PageContainer>
      <PageHeader
        title="Profile"
        description="Manage your student profile and personal details."
      />

      <div className="grid gap-4 lg:grid-cols-[22rem_1fr]">
        <Card>
          <CardContent className="flex flex-col items-center pt-6 text-center">
            <div className="relative">
              <div className="flex size-32 items-center justify-center overflow-hidden rounded-full border border-blue-400/30 bg-blue-500/15 text-3xl font-semibold text-blue-100 shadow-2xl shadow-blue-950/25">
                {profile.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>
              <label className="absolute bottom-0 right-0 flex size-10 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-[#111827] text-blue-200 shadow-xl shadow-black/30 transition hover:-translate-y-0.5 hover:bg-white/[0.08]">
                <Camera className="size-4" aria-hidden="true" />
                <span className="sr-only">Upload avatar</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0]

                    if (file) {
                      handleAvatar(file)
                    }
                  }}
                />
              </label>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-zinc-50">
              {profile.name || "Student Hub"}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {profile.course || "Course"} - {profile.yearLevel || "Year level"}
            </p>
            <Button
              type="button"
              variant="ghost"
              onClick={() => updateProfile({ avatar: "" })}
              className="mt-4 h-10 rounded-xl border border-white/10 bg-white/[0.04] text-zinc-100"
            >
              <UserRound className="size-4" aria-hidden="true" />
              Remove Avatar
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label="Name">
              <Input
                value={profile.name}
                onChange={(event) => updateProfile({ name: event.target.value })}
                placeholder="Your name"
              />
            </Field>
            <Field label="School">
              <Input
                value={profile.school}
                onChange={(event) => updateProfile({ school: event.target.value })}
                placeholder="School or university"
              />
            </Field>
            <Field label="Course">
              <Input
                value={profile.course}
                onChange={(event) => updateProfile({ course: event.target.value })}
                placeholder="BS Computer Science"
              />
            </Field>
            <Field label="Year Level">
              <Input
                value={profile.yearLevel}
                onChange={(event) => updateProfile({ yearLevel: event.target.value })}
                placeholder="2nd year"
              />
            </Field>
            <Field label="Student ID">
              <Input
                value={profile.studentId}
                onChange={(event) => updateProfile({ studentId: event.target.value })}
                placeholder="2026-0001"
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={profile.email}
                onChange={(event) => updateProfile({ email: event.target.value })}
                placeholder="you@example.com"
              />
            </Field>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
