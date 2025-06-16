"use client"

import { useState, useEffect } from "react"

// Simple icons as components to avoid lucide-react issues
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const SettingsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const MessageIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
)

const RocketIcon = () => (
  <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
)

const StarIcon = () => (
  <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    />
  </svg>
)

interface Todo {
  id: number
  text: string
  completed: boolean
  createdAt: Date
}

interface NotificationSettings {
  enabled: boolean
  facebookUserId: string
  serverUrl: string
}

export default function SpaceMissionControl() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")
  const [showSettings, setShowSettings] = useState(false)
  const [notifications, setNotifications] = useState<NotificationSettings>({
    enabled: false,
    facebookUserId: "",
    serverUrl: "",
  })

  // Load data from localStorage
  useEffect(() => {
    const savedTodos = localStorage.getItem("space-mission-todos")
    const savedNotifications = localStorage.getItem("space-mission-notifications")

    if (savedTodos) {
      try {
        const parsedTodos = JSON.parse(savedTodos)
        setTodos(
          parsedTodos.map((todo: any) => ({
            ...todo,
            createdAt: new Date(todo.createdAt),
          })),
        )
      } catch (error) {
        console.error("Error loading todos:", error)
      }
    }

    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications))
      } catch (error) {
        console.error("Error loading notifications:", error)
      }
    } else {
      // Set default server URL to current domain
      setNotifications((prev) => ({
        ...prev,
        serverUrl: typeof window !== "undefined" ? window.location.origin : "",
      }))
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("space-mission-todos", JSON.stringify(todos))
    }
  }, [todos])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("space-mission-notifications", JSON.stringify(notifications))
    }
  }, [notifications])

  const addTodo = async () => {
    if (newTodo.trim()) {
      const todo: Todo = {
        id: Date.now(),
        text: newTodo.trim(),
        completed: false,
        createdAt: new Date(),
      }

      setTodos([todo, ...todos])
      setNewTodo("")

      // Send notification
      if (notifications.enabled && notifications.facebookUserId) {
        await sendNotification(`🚀 Nhiệm vụ mới: ${todo.text}`)
      }
    }
  }

  const toggleTodo = async (id: number) => {
    const updatedTodos = todos.map((todo) => {
      if (todo.id === id) {
        const updated = { ...todo, completed: !todo.completed }

        // Send notification for completion
        if (!todo.completed && updated.completed && notifications.enabled && notifications.facebookUserId) {
          sendNotification(`✅ Hoàn thành: ${todo.text}`)
        }

        return updated
      }
      return todo
    })

    setTodos(updatedTodos)
  }

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  const sendNotification = async (message: string) => {
    if (!notifications.facebookUserId || !notifications.serverUrl) {
      console.log("❌ Missing Facebook User ID or Server URL")
      return
    }

    try {
      console.log("📤 Sending notification:", message)

      const response = await fetch(`${notifications.serverUrl}/api/send-messenger`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: notifications.facebookUserId,
          message: message,
        }),
      })

      const result = await response.json()

      if (result.success) {
        console.log("✅ Notification sent successfully!")
      } else {
        console.error("❌ Failed to send notification:", result.error)
      }
    } catch (error) {
      console.error("❌ Notification error:", error)
    }
  }

  const testNotification = async () => {
    await sendNotification(`🧪 Test từ Space Mission Control!

Thời gian: ${new Date().toLocaleString("vi-VN")}

Nếu bạn nhận được tin nhắn này, nghĩa là hệ thống hoạt động hoàn hảo! 🌟`)
  }

  const completedCount = todos.filter((todo) => todo.completed).length
  const totalCount = todos.length

  return (
    <div className="min-h-screen text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <RocketIcon />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Space Mission Control
            </h1>
            <StarIcon />
          </div>
          <p className="text-blue-200">Quản lý nhiệm vụ với thông báo Messenger</p>

          {totalCount > 0 && (
            <div className="mt-4 text-sm text-blue-300">
              Hoàn thành: {completedCount}/{totalCount} nhiệm vụ
            </div>
          )}
        </div>

        {/* Settings Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            <SettingsIcon />
            Cài đặt
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageIcon />
              Thông báo Messenger
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="notifications"
                  checked={notifications.enabled}
                  onChange={(e) => setNotifications((prev) => ({ ...prev, enabled: e.target.checked }))}
                  className="w-4 h-4"
                />
                <label htmlFor="notifications" className="text-sm">
                  Bật thông báo Messenger
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Facebook User ID:</label>
                <input
                  type="text"
                  value={notifications.facebookUserId}
                  onChange={(e) => setNotifications((prev) => ({ ...prev, facebookUserId: e.target.value }))}
                  placeholder="Nhập Facebook User ID của bạn"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                />
                <p className="text-xs text-gray-400 mt-1">Nhắn tin vào Facebook Page để lấy User ID</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Server URL:</label>
                <input
                  type="text"
                  value={notifications.serverUrl}
                  onChange={(e) => setNotifications((prev) => ({ ...prev, serverUrl: e.target.value }))}
                  placeholder="https://your-server.vercel.app"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                />
              </div>

              {notifications.enabled && notifications.facebookUserId && (
                <button
                  onClick={testNotification}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition-colors"
                >
                  🧪 Test thông báo
                </button>
              )}
            </div>
          </div>
        )}

        {/* Add Todo */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700">
          <div className="flex gap-3">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addTodo()}
              placeholder="Thêm nhiệm vụ mới..."
              className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addTodo}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <PlusIcon />
              Thêm
            </button>
          </div>
        </div>

        {/* Todo List */}
        <div className="space-y-3">
          {todos.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="w-16 h-16 mx-auto mb-4 opacity-50">
                <RocketIcon />
              </div>
              <p>Chưa có nhiệm vụ nào. Hãy thêm nhiệm vụ đầu tiên!</p>
            </div>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 transition-all ${
                  todo.completed ? "opacity-75" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      todo.completed
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-gray-400 hover:border-green-400"
                    }`}
                  >
                    {todo.completed && <CheckIcon />}
                  </button>

                  <div className="flex-1">
                    <p className={`${todo.completed ? "line-through text-gray-400" : "text-white"}`}>{todo.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{todo.createdAt.toLocaleString("vi-VN")}</p>
                  </div>

                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-400 text-sm">
          <p>🚀 Space Mission Control - Powered by Next.js & Messenger API</p>
        </div>
      </div>
    </div>
  )
}
