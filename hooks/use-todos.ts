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

    const savedTodos = localStorage.getItem("space-todos")
    const savedSettings = localStorage.getItem("space-settings")

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
    localStorage.setItem("space-todos", JSON.stringify(todos))
  }, [todos, isClient])

  useEffect(() => {
    if (!isClient) return
    localStorage.setItem("space-settings", JSON.stringify(settings))
  }, [settings, isClient])

  // Send messenger notification
  const sendMessengerNotification = async (message: string) => {
    if (!isClient || !settings.enableMessengerNotifications || !settings.messengerUserId) {
      return
    }

    // 🚨 THAY ĐỔI URL NÀY THÀNH SERVER THẬT CỦA BẠN!
    // Ví dụ: https://space-mission-server-abc123.vercel.app
    const SERVER_URL = "https://todoship.vercel.app"

    try {
      const response = await fetch(`${SERVER_URL}/send-messenger`, {
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

      if (response.ok) {
        console.log("✅ Messenger notification sent successfully!")

        // Show browser notification as confirmation
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("🚀 Space Mission", {
            body: "Tin nhắn đã được gửi qua Messenger!",
            icon: "/favicon.ico",
          })
        }
      } else {
        console.error("❌ Failed to send messenger notification:", response.status)
      }
    } catch (error) {
      console.error("❌ Network error:", error)

      // Fallback: Browser notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("🚀 Space Mission", {
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

    Notification.requestPermission()
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

      // Send notification if conditions are met
      if ((hoursUntilReset === 3 || hoursUntilReset === 4) && incompleteTodos > 0) {
        const message = `🚀 Space Mission Alert! 

Bạn còn ${hoursUntilReset} tiếng để hoàn thành ${incompleteTodos} nhiệm vụ trước khi reset!

⏰ Reset time: ${resetTime}
📝 Nhiệm vụ chưa hoàn thành: ${incompleteTodos}

Hãy nhanh chóng hoàn thành để đạt được mục tiêu hôm nay! 🌟`

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

      if (today !== settings.lastResetDate && currentTime >= settings.resetTime) {
        setTodos((prev) => prev.map((todo) => ({ ...todo, completed: false })))
        setSettings((prev) => ({ ...prev, lastResetDate: today }))
        celebrationShownRef.current = false

        sendMessengerNotification(`🌅 Chào buổi sáng! 

Tất cả nhiệm vụ đã được reset cho ngày mới.

📅 Ngày: ${new Date().toLocaleDateString("vi-VN")}
⏰ Thời gian reset: ${settings.resetTime}

Hãy bắt đầu một ngày mới đầy năng lượng! 🚀`)
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

    if (totalCount > 0 && completedCount === totalCount && !celebrationShownRef.current) {
      setShowCelebration(true)
      celebrationShownRef.current = true

      sendMessengerNotification(`🎉 CHÚC MỪNG! 

Bạn đã hoàn thành TẤT CẢ nhiệm vụ hôm nay! 

🏆 Hoàn thành: ${completedCount}/${totalCount}
⭐ Thành tích tuyệt vời!
🚀 Bạn là một phi hành gia xuất sắc!

Hãy nghỉ ngơi và chuẩn bị cho những thử thách mới! 🌟`)
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
