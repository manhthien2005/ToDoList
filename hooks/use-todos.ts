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
  const [isClient, setIsClient] = useState(false)

  // Set client flag
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load data from localStorage (only on client)
  useEffect(() => {
    if (!isClient) return

    const savedTodos = localStorage.getItem("cute-todos")
    const savedSettings = localStorage.getItem("cute-settings")

    if (savedTodos) {
      try {
        const parsedTodos = JSON.parse(savedTodos).map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          updatedAt: new Date(todo.updatedAt),
        }))
        setTodos(parsedTodos)
      } catch (error) {
        console.error("Error parsing todos:", error)
      }
    }

    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error("Error parsing settings:", error)
      }
    }
  }, [isClient])

  // Save to localStorage (only on client)
  useEffect(() => {
    if (!isClient) return
    localStorage.setItem("cute-todos", JSON.stringify(todos))
  }, [todos, isClient])

  useEffect(() => {
    if (!isClient) return
    localStorage.setItem("cute-settings", JSON.stringify(settings))
  }, [settings, isClient])

  // Send messenger notification với browser check
  const sendMessengerNotification = async (message: string) => {
    if (!isClient || !settings.enableMessengerNotifications || !settings.messengerUserId) {
      console.log("📴 Messenger notifications disabled or no user ID")
      return
    }

    try {
      console.log("🚀 Sending messenger notification:", message)
      console.log("👤 User ID:", settings.messengerUserId)

      const response = await fetch("/api/send-messenger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          userId: settings.messengerUserId,
          message: message,
        }),
      })

      console.log("📊 Response status:", response.status)

      if (response.ok) {
        const result = await response.json()
        console.log("✅ Messenger notification sent successfully:", result)

        // Show browser notification as backup
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("🚀 Space Mission", {
            body: message,
            icon: "/favicon.ico",
          })
        }
      } else {
        const errorText = await response.text()
        console.error("❌ Failed to send messenger notification:")
        console.error("Status:", response.status)
        console.error("Response:", errorText)
      }
    } catch (error) {
      console.error("❌ Network error:", error)

      // Fallback: Browser notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("🚀 Space Mission (Fallback)", {
          body: message,
          icon: "/favicon.ico",
        })
      }
    }
  }

  // Request notification permission on first load
  useEffect(() => {
    if (
      !isClient ||
      !settings.enableMessengerNotifications ||
      !("Notification" in window) ||
      Notification.permission !== "default"
    ) {
      return
    }

    Notification.requestPermission().then((permission) => {
      console.log("🔔 Notification permission:", permission)
    })
  }, [settings.enableMessengerNotifications, isClient])

  // Check reminder logic
  useEffect(() => {
    if (!isClient) return

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

      console.log("⏰ Reminder check:", {
        currentTime,
        resetTime,
        hoursUntilReset,
        minutesUntilReset: minutesUntilReset % 60,
        incompleteTodos,
        shouldNotify: (hoursUntilReset === 3 || hoursUntilReset === 4) && incompleteTodos > 0,
        messengerEnabled: settings.enableMessengerNotifications,
        hasUserId: !!settings.messengerUserId,
      })

      // Send notification if conditions are met
      if ((hoursUntilReset === 3 || hoursUntilReset === 4) && incompleteTodos > 0) {
        const message = `🚀 Space Mission Alert! Bạn còn ${hoursUntilReset} tiếng để hoàn thành ${incompleteTodos} nhiệm vụ trước khi reset!`
        sendMessengerNotification(message)
      }
    }

    // Check every hour
    const interval = setInterval(checkReminders, 60 * 60 * 1000)
    checkReminders()

    return () => clearInterval(interval)
  }, [todos, settings, isClient])

  // Check if we need to reset completed status
  useEffect(() => {
    if (!isClient) return

    const checkReset = () => {
      const now = new Date()
      const today = now.toISOString().split("T")[0]
      const currentTime = now.toTimeString().slice(0, 5)

      console.log("🔄 Reset check:", {
        today,
        lastResetDate: settings.lastResetDate,
        currentTime,
        resetTime: settings.resetTime,
        shouldReset: today !== settings.lastResetDate && currentTime >= settings.resetTime,
      })

      if (today !== settings.lastResetDate && currentTime >= settings.resetTime) {
        console.log("🌅 Resetting todos for new day")
        setTodos((prev) => prev.map((todo) => ({ ...todo, completed: false })))
        setSettings((prev) => ({ ...prev, lastResetDate: today }))
        celebrationShownRef.current = false

        sendMessengerNotification("🌅 Chào buổi sáng! Tất cả nhiệm vụ đã được reset. Hãy bắt đầu ngày mới!")
      }
    }

    checkReset()
    const interval = setInterval(checkReset, 60000)
    return () => clearInterval(interval)
  }, [settings.resetTime, settings.lastResetDate, isClient])

  // Check for celebration
  useEffect(() => {
    if (!isClient) return

    const completedCount = todos.filter((todo) => todo.completed).length
    const totalCount = todos.length

    console.log("🎉 Celebration check:", {
      completedCount,
      totalCount,
      allCompleted: totalCount > 0 && completedCount === totalCount,
      celebrationShown: celebrationShownRef.current,
    })

    if (totalCount > 0 && completedCount === totalCount && !celebrationShownRef.current) {
      console.log("🎊 Triggering celebration!")
      setShowCelebration(true)
      celebrationShownRef.current = true

      sendMessengerNotification("🎉 Chúc mừng! Bạn đã hoàn thành tất cả nhiệm vụ hôm nay! 🚀")
    }

    // Reset flag when not all todos are completed
    if (completedCount < totalCount) {
      celebrationShownRef.current = false
    }
  }, [todos, isClient])

  const addTodo = (text: string) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setTodos((prev) => [...prev, newTodo])
    console.log("➕ Added todo:", newTodo)
  }

  const updateTodo = (id: string, updates: Partial<Todo>) => {
    setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, ...updates, updatedAt: new Date() } : todo)))
    console.log("✏️ Updated todo:", id, updates)
  }

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
    console.log("🗑️ Deleted todo:", id)
  }

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed, updatedAt: new Date() } : todo)),
    )
    console.log("✅ Toggled todo:", id)
  }

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
    console.log("⚙️ Updated settings:", newSettings)
  }

  const closeCelebration = () => {
    setShowCelebration(false)
    celebrationShownRef.current = true
    console.log("🎊 Closed celebration")
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
