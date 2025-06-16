"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Check, Settings, MessageCircle, Rocket, Star } from "lucide-react"

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
      const parsedTodos = JSON.parse(savedTodos)
      setTodos(
        parsedTodos.map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
        })),
      )
    }

    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications))
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
            <Rocket className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Space Mission Control
            </h1>
            <Star className="w-8 h-8 text-yellow-400" />
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
            <Settings className="w-4 h-4" />
            Cài đặt
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
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
              <Plus className="w-4 h-4" />
              Thêm
            </button>
          </div>
        </div>

        {/* Todo List */}
        <div className="space-y-3">
          {todos.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Rocket className="w-16 h-16 mx-auto mb-4 opacity-50" />
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
                    {todo.completed && <Check className="w-4 h-4" />}
                  </button>

                  <div className="flex-1">
                    <p className={`${todo.completed ? "line-through text-gray-400" : "text-white"}`}>{todo.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{todo.createdAt.toLocaleString("vi-VN")}</p>
                  </div>

                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
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
