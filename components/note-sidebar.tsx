"use client"

import type { Note } from "../types/note"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, FileText, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"

interface NoteSidebarProps {
  notes: Note[]
  selectedNote: Note | null
  onSelectNote: (note: Note) => void
  onCreateNote: () => void
  onDeleteNote: (id: string) => void
}

export function NoteSidebar({ notes, selectedNote, onSelectNote, onCreateNote, onDeleteNote }: NoteSidebarProps) {
  return (
    <div className="w-80 border-r bg-muted/10 flex flex-col">
      <div className="p-4 border-b">
        <Button onClick={onCreateNote} className="w-full" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Tạo ghi chú mới
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {notes.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Chưa có ghi chú nào</p>
              <p className="text-sm">Nhấn "Tạo ghi chú mới" để bắt đầu</p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 group ${
                  selectedNote?.id === note.id ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50"
                }`}
                onClick={() => onSelectNote(note)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate mb-1">{note.title || "Không có tiêu đề"}</h3>
                    <p className="text-xs text-muted-foreground truncate mb-2">{note.content || "Không có nội dung"}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(note.updatedAt, {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteNote(note.id)
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
