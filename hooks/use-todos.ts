"use client"

import { useState, useEffect, useRef } from "react"
import type { Todo, Settings } from "../types/todo"

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [settings, setSettings] = useState<Settings>({
    resetTime: "06:00",
    lastResetDate: new Date().toISOString().split("T")[0],
  })
  const [showCelebration, setShowCelebration] = useState(false)
  const celebrationShownRef = useRef(false) // Prevent showing celebration multiple times

  // Load data from localStorage
  useEffect(() => {
    const savedTodos = localStorage.getItem("cute-todos")
    const savedSettings = localStorage.getItem("cute-settings")

    if (savedTodos) {
      const parsedTodos = JSON.parse(savedTodos).map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        updatedAt: new Date(todo.updatedAt),
      }))
      setTodos(parsedTodos)
    }

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("cute-todos", JSON.stringify(todos))
  }, [todos])

  useEffect(() => {
    localStorage.setItem("cute-settings", JSON.stringify(settings))
  }, [settings])

  // Check if we need to reset completed status
  useEffect(() => {
    const checkReset = () => {
      const now = new Date()
      const today = now.toISOString().split("T")[0]
      const currentTime = now.toTimeString().slice(0, 5)

      if (today !== settings.lastResetDate && currentTime >= settings.resetTime) {
        setTodos((prev) => prev.map((todo) => ({ ...todo, completed: false })))
        setSettings((prev) => ({ ...prev, lastResetDate: today }))
        celebrationShownRef.current = false // Reset celebration flag
      }
    }

    checkReset()
    const interval = setInterval(checkReset, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [settings.resetTime, settings.lastResetDate])

  // Check for celebration - only show once per completion session
  useEffect(() => {
    const completedCount = todos.filter((todo) => todo.completed).length
    const totalCount = todos.length

    if (totalCount > 0 && completedCount === totalCount && !celebrationShownRef.current) {
      setShowCelebration(true)
      celebrationShownRef.current = true
    }

    // Reset flag when not all todos are completed
    if (completedCount < totalCount) {
      celebrationShownRef.current = false
    }
  }, [todos])

  const addTodo = (text: string) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setTodos((prev) => [...prev, newTodo])
  }

  const updateTodo = (id: string, updates: Partial<Todo>) => {
    setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, ...updates, updatedAt: new Date() } : todo)))
  }

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed, updatedAt: new Date() } : todo)),
    )
  }

  const updateResetTime = (time: string) => {
    setSettings((prev) => ({ ...prev, resetTime: time }))
  }

  const closeCelebration = () => {
    setShowCelebration(false)
    celebrationShownRef.current = true // Prevent showing again until next completion cycle
  }

  return {
    todos,
    settings,
    showCelebration,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    updateResetTime,
    closeCelebration,
  }
}
