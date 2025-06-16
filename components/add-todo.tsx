"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"

interface AddTodoProps {
  onAdd: (text: string) => void
}

export function AddTodo({ onAdd }: AddTodoProps) {
  const [text, setText] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim()) {
      onAdd(text.trim())
      setText("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Thêm nhiệm vụ mới..."
        className="flex-1 rounded-2xl border-slate-600 focus:border-blue-400 bg-slate-800/70 backdrop-blur-sm placeholder:text-gray-400 text-gray-200"
      />
      <Button
        type="submit"
        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-2xl px-6 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <Plus className="w-5 h-5" />
      </Button>
    </form>
  )
}
