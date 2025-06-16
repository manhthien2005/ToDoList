"use client"

import { useState, useEffect, useRef } from "react"
import type { Todo, Settings } from "../types/todo"

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [settings, setSettings] = useState<Settings>({
    resetTime: "06:00",
    lastResetDate: new Date().toISOString().split("T")[0],
    enableMessengerNotifications: false,
  })
  const [showCelebration, setShowCelebration] = useState(false)
  const celebrationShownRef = useRef(false)

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

  // Send messenger notification - CẬP NHẬT URL SERVER
  const sendMessengerNotification = async (message: string) => {
    if (!settings.enableMessengerNotifications || !settings.messengerUserId) {
      console.log("Messenger notifications disabled or no user ID")
      return
    }

    try {
      console.log("Sending messenger notification:", message)

      // THAY ĐỔI URL NÀY THÀNH SERVER CỦA BẠN
      const response = await fetch("https://your-server-url.vercel.app/send-messenger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: settings.messengerUserId,
          message: message,
        }),
      })

      if (response.ok) {
        console.log("✅ Messenger notification sent successfully")
      } else {
        const errorText = await response.text()
        console.error("❌ Failed to send messenger notification:", response.status, errorText)
      }
    } catch (error) {
      console.error("❌ Messenger notification error:", error)
    }
  }

  // Check reminder logic
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date()
      const currentTime = now.toTimeString().slice(0, 5)
      const resetTime = settings.resetTime

      const [resetHour, resetMinute] = resetTime.split(":").map(Number)
      const [currentHour, currentMinute] = currentTime.split(":").map(Number)

      const resetTimeInMinutes = resetHour * 60 + resetMinute
      const currentTimeInMinutes = currentHour * 60 + currentMinute

      let minutesUntilReset = resetTimeInMinutes - currentTimeInMinutes
      if (minutesUntilReset < 0) {
        minutesUntilReset += 24 * 60
      }

      const hoursUntilReset = Math.floor(minutesUntilReset / 60)
      const incompleteTodos = todos.filter((todo) => !todo.completed).length

      console.log("Reminder check:", {
        currentTime,
        resetTime,
        hoursUntilReset,
        incompleteTodos,
        shouldNotify: (hoursUntilReset === 3 || hoursUntilReset === 4) && incompleteTodos > 0,
      })

      if ((hoursUntilReset === 3 || hoursUntilReset === 4) && incompleteTodos > 0) {
        const message = `🚀 Space Mission Alert! Bạn còn ${hoursUntilReset} tiếng để hoàn thành ${incompleteTodos} nhiệm vụ trước khi reset!`
        sendMessengerNotification(message)
      }
    }

    const interval = setInterval(checkReminders, 60 * 60 * 1000)
    checkReminders()
    return () => clearInterval(interval)
  }, [todos, settings])

  // Check if we need to reset completed status
  useEffect(() => {
    const checkReset = () => {
      const now = new Date()
      const today = now.toISOString().split("T")[0]
      const currentTime = now.toTimeString().slice(0, 5)

      if (today !== settings.lastResetDate && currentTime >= settings.resetTime) {
        setTodos((prev) => prev.map((todo) => ({ ...todo, completed: false })))
        setSettings((prev) => ({ ...prev, lastResetDate: today }))
        celebrationShownRef.current = false

        sendMessengerNotification("🌅 Chào buổi sáng! Tất cả nhiệm vụ đã được reset. Hãy bắt đầu ngày mới!")
      }
    }

    checkReset()
    const interval = setInterval(checkReset, 60000)
    return () => clearInterval(interval)
  }, [settings.resetTime, settings.lastResetDate])

  // Check for celebration
  useEffect(() => {
    const completedCount = todos.filter((todo) => todo.completed).length
    const totalCount = todos.length

    if (totalCount > 0 && completedCount === totalCount && !celebrationShownRef.current) {
      setShowCelebration(true)
      celebrationShownRef.current = true

      sendMessengerNotification("🎉 Chúc mừng! Bạn đã hoàn thành tất cả nhiệm vụ hôm nay! 🚀")
    }

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

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const closeCelebration = () => {
    setShowCelebration(false)
    celebrationShownRef.current = true
  }

  return {
    todos,
    settings,
    showCelebration,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    updateSettings,
    closeCelebration,
  }
}
