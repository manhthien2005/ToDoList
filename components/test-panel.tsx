"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TestTube, CheckCircle, XCircle, Bell } from "lucide-react"
import type { Settings } from "../types/todo"

interface TestPanelProps {
  settings: Settings
  todos: any[]
}

export function TestPanel({ settings, todos }: TestPanelProps) {
  const [testResults, setTestResults] = useState<Array<{ type: string; message: string; success: boolean }>>([])
  const [isLoading, setIsLoading] = useState(false)

  const addTestResult = (type: string, message: string, success: boolean) => {
    setTestResults((prev) => [...prev, { type, message, success, timestamp: Date.now() }])
  }

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      addTestResult("Browser", "❌ Browser không hỗ trợ notifications", false)
      return
    }

    const permission = await Notification.requestPermission()
    addTestResult("Browser", `🔔 Notification permission: ${permission}`, permission === "granted")

    if (permission === "granted") {
      new Notification("🚀 Space Mission Test", {
        body: "Browser notifications đã hoạt động!",
        icon: "/favicon.ico",
      })
    }
  }

  const testApiEndpoint = async () => {
    setIsLoading(true)
    addTestResult("API", "Đang test API endpoint...", true)

    try {
      const response = await fetch("/api/send-messenger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: settings.messengerUserId || "test_user_123",
          message: "🧪 Test message từ Space Mission Control!",
        }),
      })

      const responseData = await response.json()

      if (response.ok) {
        addTestResult("API", `✅ API hoạt động: ${JSON.stringify(responseData)}`, true)
      } else {
        addTestResult("API", `❌ API lỗi ${response.status}: ${JSON.stringify(responseData)}`, false)
      }
    } catch (error) {
      addTestResult("API", `❌ Không thể kết nối API: ${error.message}`, false)
    }

    setIsLoading(false)
  }

  const testReminderLogic = () => {
    const now = new Date()
    const [resetHour, resetMinute] = settings.resetTime.split(":").map(Number)
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    const resetTimeInMinutes = resetHour * 60 + resetMinute
    const currentTimeInMinutes = currentHour * 60 + currentMinute

    let minutesUntilReset = resetTimeInMinutes - currentTimeInMinutes
    if (minutesUntilReset < 0) {
      minutesUntilReset += 24 * 60
    }

    const hoursUntilReset = Math.floor(minutesUntilReset / 60)
    const incompleteTodos = todos.filter((todo) => !todo.completed).length

    addTestResult("Logic", `⏰ Hiện tại: ${currentHour}:${currentMinute.toString().padStart(2, "0")}`, true)
    addTestResult("Logic", `🔄 Reset lúc: ${settings.resetTime}`, true)
    addTestResult("Logic", `⏳ Còn ${hoursUntilReset}h ${minutesUntilReset % 60}m đến reset`, true)
    addTestResult("Logic", `📝 ${incompleteTodos} nhiệm vụ chưa hoàn thành`, true)

    const shouldNotify = (hoursUntilReset === 3 || hoursUntilReset === 4) && incompleteTodos > 0
    addTestResult("Logic", shouldNotify ? "🔔 SẼ gửi thông báo!" : "⏸️ Chưa đến lúc thông báo", shouldNotify)
  }

  const simulateCompletion = async () => {
    if (todos.length === 0) {
      addTestResult("Simulate", "❌ Cần có ít nhất 1 todo để test", false)
      return
    }

    addTestResult("Simulate", "🎯 Giả lập hoàn thành tất cả todos...", true)

    // Trigger completion notification
    const message = "🎉 [TEST] Chúc mừng! Bạn đã hoàn thành tất cả nhiệm vụ!"

    try {
      const response = await fetch("/api/send-messenger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: settings.messengerUserId || "test_user_123",
          message: message,
        }),
      })

      if (response.ok) {
        addTestResult("Simulate", "✅ Thông báo hoàn thành đã được gửi!", true)
      } else {
        addTestResult("Simulate", "❌ Lỗi gửi thông báo hoàn thành", false)
      }
    } catch (error) {
      addTestResult("Simulate", `❌ Lỗi: ${error.message}`, false)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <Card className="bg-slate-800/70 backdrop-blur-sm border-slate-600/50 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-200">
          <TestTube className="w-5 h-5 text-green-400" />
          Test & Debug Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex flex-wrap gap-2">
          <Badge variant={settings.enableMessengerNotifications ? "default" : "secondary"}>
            {settings.enableMessengerNotifications ? "✅ Messenger ON" : "❌ Messenger OFF"}
          </Badge>
          <Badge variant={settings.messengerUserId ? "default" : "secondary"}>
            {settings.messengerUserId ? "✅ User ID Set" : "❌ No User ID"}
          </Badge>
          <Badge variant={Notification.permission === "granted" ? "default" : "secondary"}>
            {Notification.permission === "granted" ? "✅ Browser Notifications" : "❌ No Browser Permission"}
          </Badge>
        </div>

        {/* Test Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={testReminderLogic}
            size="sm"
            variant="outline"
            className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
          >
            Test Logic
          </Button>
          <Button
            onClick={testApiEndpoint}
            size="sm"
            variant="outline"
            className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
            disabled={isLoading}
          >
            {isLoading ? "Testing..." : "Test API"}
          </Button>
          <Button
            onClick={requestNotificationPermission}
            size="sm"
            variant="outline"
            className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
          >
            <Bell className="w-4 h-4 mr-1" />
            Enable Browser Notifications
          </Button>
          <Button
            onClick={simulateCompletion}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
            disabled={isLoading}
          >
            Test Completion
          </Button>
          <Button onClick={clearResults} size="sm" variant="ghost" className="text-gray-400">
            Clear
          </Button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            <h4 className="text-sm font-medium text-gray-300">Test Results:</h4>
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 text-sm p-3 rounded ${
                  result.success ? "bg-green-900/20 text-green-300" : "bg-red-900/20 text-red-300"
                }`}
              >
                {result.success ? (
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                )}
                <div className="whitespace-pre-wrap">
                  <span className="font-medium">[{result.type}]</span> {result.message}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-slate-700/30 rounded-lg p-3 text-xs text-gray-400 space-y-2">
          <h5 className="font-medium text-gray-300">🔧 Hướng dẫn:</h5>
          <ul className="space-y-1 ml-4">
            <li>
              • <strong>Test Logic:</strong> Kiểm tra logic thời gian và điều kiện
            </li>
            <li>
              • <strong>Test API:</strong> Kiểm tra API endpoint (hiện tại là mock)
            </li>
            <li>
              • <strong>Browser Notifications:</strong> Bật thông báo trình duyệt làm backup
            </li>
            <li>
              • <strong>Test Completion:</strong> Giả lập hoàn thành tất cả todos
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
