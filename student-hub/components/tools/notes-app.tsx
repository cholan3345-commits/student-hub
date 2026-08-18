"use client"

import { useMemo, useState } from "react"
import { NotebookPen, Pin, Plus, Star, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmButton } from "@/components/ui/confirm-button"
import { EmptyState } from "@/components/ui/empty-state"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/toast"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { formatDateLabel } from "@/lib/date"
import { NOTE_CATEGORIES, type Note, type NoteCategory } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useNotes } from "@/hooks/use-notes"

export function NotesApp() {
  const { addNote, deleteNote, notes, toggleFavorite, togglePinned, updateNote } =
    useNotes()
  const { toast } = useToast()
  const [query, setQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<"All" | NoteCategory>("All")
  const [activeId, setActiveId] = useState<string | null>(null)

  const filteredNotes = useMemo(() => {
    const search = query.trim().toLowerCase()

    return notes
      .filter((note) => {
        const matchesQuery =
          !search ||
          [note.title, note.category, note.content].join(" ").toLowerCase().includes(search)
        const matchesCategory =
          categoryFilter === "All" || note.category === categoryFilter

        return matchesQuery && matchesCategory
      })
      .sort((a, b) => {
        if (a.pinned !== b.pinned) {
          return a.pinned ? -1 : 1
        }

        if (a.favorite !== b.favorite) {
          return a.favorite ? -1 : 1
        }

        return Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
      })
  }, [categoryFilter, notes, query])

  const activeNote =
    (activeId ? notes.find((note) => note.id === activeId) : null) ??
    filteredNotes[0] ??
    null

  function createNote() {
    const note = addNote({
      category: "School",
      content: "",
      favorite: false,
      pinned: false,
      title: "Untitled note",
    })

    setActiveId(note.id)
    toast({
      message: "A new note is ready for editing.",
      title: "Note created",
      tone: "success",
    })
  }

  function removeNote(note: Note) {
    deleteNote(note.id)
    setActiveId(null)
    toast({
      message: "The note was deleted.",
      title: "Note deleted",
      tone: "info",
    })
  }

  return (
    <PageContainer>
      <PageHeader
        title="Notes"
        description="Capture lecture notes, ideas, and study summaries."
      />

      <div className="grid gap-4 xl:grid-cols-[22rem_1fr]">
        <div className="grid gap-4">
          <Card>
            <CardContent className="grid gap-3 pt-4 sm:pt-5">
              <Button
                type="button"
                onClick={createNote}
                className="h-10 rounded-xl"
              >
                <Plus className="size-4" aria-hidden="true" />
                Create Note
              </Button>
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search notes"
                aria-label="Search notes"
              />
              <Select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value as "All" | NoteCategory)
                }
                aria-label="Filter notes by category"
              >
                <option value="All">All categories</option>
                {NOTE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
            </CardContent>
          </Card>

          {filteredNotes.length === 0 ? (
            <EmptyState
              icon={NotebookPen}
              title="No notes yet"
              description="Create a note to start capturing ideas and class details."
            />
          ) : (
            <div className="grid gap-3">
              {filteredNotes.map((note) => (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => setActiveId(note.id)}
                  className={cn(
                    "hub-glass-control rounded-2xl p-4 text-left shadow-xl shadow-black/20 transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-[var(--hub-accent-border)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hub-accent-ring)]",
                    activeNote?.id === note.id &&
                      "border-[var(--hub-accent-border)] bg-[var(--hub-accent-soft)]"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid min-w-0 gap-1">
                      <h3 className="break-words text-sm font-semibold text-zinc-50">
                        {note.title || "Untitled note"}
                      </h3>
                      <p className="line-clamp-2 text-sm leading-6 text-zinc-500">
                        {note.content || "No content yet."}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1.5 text-zinc-500">
                      {note.pinned ? (
                        <Pin className="size-4 text-[var(--hub-accent)]" />
                      ) : null}
                      {note.favorite ? (
                        <Star className="size-4 fill-amber-300 text-amber-300" />
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <Badge tone="zinc">{note.category}</Badge>
                    <span className="text-xs text-zinc-500">
                      {formatDateLabel(note.updatedAt.slice(0, 10))}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {activeNote ? (
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="grid min-w-0 gap-1">
                  <CardTitle>Editor</CardTitle>
                  <p className="text-sm leading-5 text-zinc-500">
                    Auto-saved {new Date(activeNote.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-lg"
                    onClick={() => togglePinned(activeNote.id)}
                    aria-label="Pin note"
                    className={cn(activeNote.pinned && "text-[var(--hub-accent)]")}
                  >
                    <Pin className="size-4" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-lg"
                    onClick={() => toggleFavorite(activeNote.id)}
                    aria-label="Favorite note"
                    className={cn(activeNote.favorite && "text-amber-200")}
                  >
                    <Star
                      className={cn(
                        "size-4",
                        activeNote.favorite && "fill-amber-300 text-amber-300"
                      )}
                      aria-hidden="true"
                    />
                  </Button>
                  <ConfirmButton
                    type="button"
                    variant="destructive"
                    size="icon-lg"
                    confirmMessage="Delete this note?"
                    onConfirm={() => removeNote(activeNote)}
                    aria-label="Delete note"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </ConfirmButton>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Field label="Title">
                <Input
                  value={activeNote.title}
                  onChange={(event) =>
                    updateNote(activeNote.id, { title: event.target.value })
                  }
                />
              </Field>
              <Field label="Category">
                <Select
                  value={activeNote.category}
                  onChange={(event) =>
                    updateNote(activeNote.id, {
                      category: event.target.value as NoteCategory,
                    })
                  }
                >
                  {NOTE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Content">
                <Textarea
                  value={activeNote.content}
                  onChange={(event) =>
                    updateNote(activeNote.id, { content: event.target.value })
                  }
                  className="min-h-[28rem]"
                  placeholder="Start writing..."
                />
              </Field>
              <div className="grid gap-2 text-sm text-zinc-500 sm:grid-cols-2">
                <p className="break-words">Created {new Date(activeNote.createdAt).toLocaleString()}</p>
                <p className="sm:text-right">
                  Modified {new Date(activeNote.updatedAt).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            icon={NotebookPen}
            title="Select or create a note"
            description="Your editor will appear here with automatic saving."
          />
        )}
      </div>
    </PageContainer>
  )
}
