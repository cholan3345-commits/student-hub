"use client"

import { useMemo, useRef, useState } from "react"
import { Download, FileText, FolderOpen, Search, Trash2, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ConfirmButton } from "@/components/ui/confirm-button"
import { EmptyState } from "@/components/ui/empty-state"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import type { StoredFile } from "@/lib/types"
import { useFiles } from "@/hooks/use-files"

export function FilesManager() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const { addFile, deleteFile, files, updateFile } = useFiles()
  const { toast } = useToast()
  const [query, setQuery] = useState("")

  const filteredFiles = useMemo(() => {
    const search = query.trim().toLowerCase()

    return files
      .filter((file) =>
        [file.name, file.type].join(" ").toLowerCase().includes(search)
      )
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
  }, [files, query])

  async function uploadFiles(fileList: FileList | null) {
    if (!fileList?.length) {
      return
    }

    const uploads = Array.from(fileList)

    for (const file of uploads) {
      const dataUrl = await readFileAsDataUrl(file)
      addFile({
        dataUrl,
        name: file.name,
        size: file.size,
        type: file.type || "Unknown",
      })
    }

    toast({
      message: `${uploads.length} file${uploads.length === 1 ? "" : "s"} uploaded.`,
      title: "Upload complete",
      tone: "success",
    })

    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Files"
        description="Organize class files, references, and resources."
      />

      <div className="grid gap-4">
        <Card>
          <CardContent className="grid gap-3 pt-4 sm:pt-5 lg:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
                aria-hidden="true"
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search files"
                aria-label="Search files"
                className="pl-9"
              />
            </div>
            <Button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="h-10 rounded-xl px-4"
            >
              <Upload className="size-4" aria-hidden="true" />
              Upload Files
            </Button>
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(event) => uploadFiles(event.target.files)}
            />
          </CardContent>
        </Card>

        {filteredFiles.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No files"
            description="Upload files to keep important class resources available in this browser."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredFiles.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                onDelete={() => {
                  deleteFile(file.id)
                  toast({
                    message: "The file was removed from local storage.",
                    title: "File deleted",
                    tone: "info",
                  })
                }}
                onRename={(name) => updateFile(file.id, { name })}
              />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  )
}

function FileCard({
  file,
  onDelete,
  onRename,
}: {
  file: StoredFile
  onDelete: () => void
  onRename: (name: string) => void
}) {
  return (
    <Card className="transition-[transform,border-color,background-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-[var(--hub-accent-border)]">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--hub-accent-border)] bg-[var(--hub-accent-soft)] text-[var(--hub-accent)]">
            <FileText className="size-5" aria-hidden="true" />
          </div>
          <div className="grid min-w-0 flex-1 gap-2">
            <Input
              value={file.name}
              onChange={(event) => onRename(event.target.value)}
              aria-label="Rename file"
              className="h-9"
            />
            <p className="text-xs leading-4 text-zinc-500">
              {formatFileSize(file.size)} - {file.type}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <a
            href={file.dataUrl}
            download={file.name}
            className="hub-accent-bg inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-xs font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5"
          >
            <Download className="size-4" aria-hidden="true" />
            Download
          </a>
          <ConfirmButton
            type="button"
            variant="destructive"
            confirmMessage="Delete this file?"
            onConfirm={onDelete}
            className="h-10 rounded-xl"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Delete
          </ConfirmButton>
        </div>
        <p className="mt-4 text-xs text-zinc-600">
          Uploaded {new Date(file.createdAt).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  )
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ""))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}
