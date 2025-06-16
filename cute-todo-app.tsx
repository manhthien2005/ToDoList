"use client"

import { useTodos } from "./hooks/use-todos"
import { TodoItem } from "./components/todo-item"
import { AddTodo } from "./components/add-todo"
import { SettingsPanel } from "./components/settings-panel"
import { ProgressBar } from "./components/progress-bar"
import { Celebration } from "./components/celebration"
import { Star, Zap } from "lucide-react"

export default function CuteTodoApp() {
  const {
    todos,
    settings,
    showCelebration,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    updateResetTime,
    closeCelebration,
  } = useTodos()

  const completedCount = todos.filter((todo) => todo.completed).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-10 left-10 opacity-30">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
      </div>
      <div className="absolute top-32 right-20 opacity-20">
        <Star className="w-16 h-16 text-yellow-300 animate-bounce" />
      </div>
      <div className="absolute bottom-20 left-20 opacity-25">
        <div
          className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full animate-spin"
          style={{ animationDuration: "8s" }}
        ></div>
      </div>
      <div className="absolute top-1/2 right-10 opacity-20">
        <Zap className="w-10 h-10 text-cyan-300 animate-pulse" />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            🚀 Space Mission Control 🌌
          </h1>
          <p className="text-gray-300">Space Ship To-do-list</p>
        </div>

        {/* Settings */}
        <SettingsPanel resetTime={settings.resetTime} onResetTimeChange={updateResetTime} />

        {/* Progress */}
        <ProgressBar completed={completedCount} total={todos.length} />

        {/* Add Todo */}
        <AddTodo onAdd={addTodo} />

        {/* Todo List */}
        <div className="space-y-3">
          {todos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌌</div>
              <p className="text-gray-400 text-lg">Chưa có nhiệm vụ nào</p>
              <p className="text-gray-500">Hãy bắt đầu cuộc hành trình vũ trụ của bạn!</p>
            </div>
          ) : (
            todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onUpdate={(id, text) => updateTodo(id, { text })}
                onDelete={deleteTodo}
              />
            ))
          )}
        </div>

        {/* Stats */}
        {todos.length > 0 && (
          <div className="mt-8 text-center">
            <div className="bg-slate-800/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-slate-600/50 inline-block">
              <p className="text-gray-300">
                <span className="font-semibold text-blue-400">{completedCount}</span> / {todos.length} nhiệm vụ đã hoàn
                thành
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Celebration */}
      <Celebration show={showCelebration} onClose={closeCelebration} />
    </div>
  )
}
