"use client"

import { useState } from "react"
import type { Todo } from "../types/todo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Edit2, Trash2, Check, X } from "lucide-react"

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onUpdate: (id: string, text: string) => void
  onDelete: (id: string) => void
}

export function TodoItem({ todo, onToggle, onUpdate, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(todo.text)

  const handleSave = () => {
    if (editText.trim()) {
      onUpdate(todo.id, editText.trim())
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setEditText(todo.text)
    setIsEditing(false)
  }

  return (
    <div
      className={`group relative bg-slate-800/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-slate-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 hover:scale-[1.02] ${
        todo.completed ? "opacity-75" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <Checkbox
          checked={todo.completed}
          onCheckedChange={() => onToggle(todo.id)}
          className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-600 data-[state=checked]:border-none"
        />

        {isEditing ? (
          <div className="flex-1 flex items-center gap-2">
            <Input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="flex-1 border-slate-600 focus:border-blue-400 rounded-xl bg-slate-700/50 text-gray-200"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave()
                if (e.key === "Escape") handleCancel()
              }}
              autoFocus
            />
            <Button
              size="sm"
              onClick={handleSave}
              className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 rounded-xl"
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel} className="rounded-xl border-gray-300">
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <>
            <span className={`flex-1 text-gray-200 ${todo.completed ? "line-through text-gray-500" : ""}`}>
              {todo.text}
            </span>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="rounded-xl hover:bg-blue-900/50 text-blue-400"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(todo.id)}
                className="rounded-xl hover:bg-red-900/50 text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
