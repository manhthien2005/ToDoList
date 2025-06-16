"use client"

import { useState, useEffect } from "react"
import type { Note } from "../types/note"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Save, FileText } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"

interface NoteEditorProps {
  note: Note | null
  onUpdateNote: (id: string, updates: Partial<Note>) => void
}

export function NoteEditor({ note, onUpdateNote }: NoteEditorProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setHasChanges(false)
    }
  }, [note])

  const handleSave = () => {
    if (note) {
      onUpdateNote(note.id, { title, content })
      setHasChanges(false)
    }
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    setHasChanges(true)
  }

  const handleContentChange = (value: string) => {
    setContent(value)
    setHasChanges(true)
  }

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-semibold mb-2">Chọn một ghi chú để chỉnh sửa</h2>
          <p>Hoặc tạo một ghi chú mới để bắt đầu viết</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex-1">
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Tiêu đề ghi chú..."
            className="text-lg font-semibold border-none shadow-none p-0 h-auto focus-visible:ring-0"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Cập nhật lần cuối:{" "}
            {formatDistanceToNow(note.updatedAt, {
              addSuffix: true,
              locale: vi,
            })}
          </p>
        </div>
        <Button onClick={handleSave} disabled={!hasChanges} size="sm" variant={hasChanges ? "default" : "secondary"}>
          <Save className="w-4 h-4 mr-2" />
          {hasChanges ? "Lưu" : "Đã lưu"}
        </Button>
      </div>

      <div className="flex-1 p-4">
        <Textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Bắt đầu viết ghi chú của bạn..."
          className="w-full h-full resize-none border-none shadow-none focus-visible:ring-0 text-base leading-relaxed"
        />
      </div>
    </div>
  )
}
