"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TestTube, CheckCircle, XCircle } from "lucide-react"
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

  const testMessengerConnection = async () => {
    setIsLoading(true)
    addTestResult("Connection", "Đang test kết nối Messenger...", true)

    try {
      // Test API endpoint
      const response = await fetch("/api/send-messenger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: settings.messengerUserId,
          message: "🧪 Test message từ Space Mission Control!",
          test: true,
        }),
      })

      if (response.ok) {
        addTestResult("Connection", "✅ Kết nối Messenger thành công!", true)
      } else {
        addTestResult("Connection", `❌ Lỗi kết nối: ${response.status}`, false)
      }
    } catch (error) {
      addTestResult("Connection", `❌ Không thể kết nối: ${error.message}`, false)
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

    addTestResult("Logic", `⏰ Còn ${hoursUntilReset} tiếng ${minutesUntilReset % 60} phút đến reset`, true)
    addTestResult("Logic", `📝 Có ${incompleteTodos} nhiệm vụ chưa hoàn thành`, true)

    if (hoursUntilReset === 3 || hoursUntilReset === 4) {
      addTestResult("Logic", "🔔 Sẽ gửi thông báo nhắc nhở!", true)
    } else {
      addTestResult("Logic", "⏳ Chưa đến thời gian nhắc nhở", true)
    }
  }

  const simulateReminder = async () => {
    if (!settings.enableMessengerNotifications) {
      addTestResult("Simulate", "❌ Messenger notifications chưa được bật", false)
      return
    }

    if (!settings.messengerUserId) {
      addTestResult("Simulate", "❌ Chưa có Facebook User ID", false)
      return
    }

    setIsLoading(true)
    const incompleteTodos = todos.filter((todo) => !todo.completed).length
    const message = `🚀 [TEST] Space Mission Alert! Bạn còn 3 tiếng để hoàn thành ${incompleteTodos} nhiệm vụ!`

    try {
      const response = await fetch("/api/send-messenger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: settings.messengerUserId,
          message: message,
        }),
      })

      if (response.ok) {
        addTestResult("Simulate", "✅ Gửi thông báo test thành công!", true)
      } else {
        addTestResult("Simulate", `❌ Lỗi gửi thông báo: ${response.status}`, false)
      }
    } catch (error) {
      addTestResult("Simulate", `❌ Lỗi: ${error.message}`, false)
    }

    setIsLoading(false)
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <Card className="bg-slate-800/70 backdrop-blur-sm border-slate-600/50 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-200">
          <TestTube className="w-5 h-5 text-green-400" />
          Test Messenger Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex flex-wrap gap-2">
          <Badge variant={settings.enableMessengerNotifications ? "default" : "secondary"}>
            {settings.enableMessengerNotifications ? "✅ Enabled" : "❌ Disabled"}
          </Badge>
          <Badge variant={settings.messengerUserId ? "default" : "secondary"}>
            {settings.messengerUserId ? "✅ User ID Set" : "❌ No User ID"}
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
            onClick={testMessengerConnection}
            size="sm"
            variant="outline"
            className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
            disabled={isLoading}
          >
            {isLoading ? "Testing..." : "Test Connection"}
          </Button>
          <Button
            onClick={simulateReminder}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
            disabled={isLoading || !settings.enableMessengerNotifications}
          >
            Send Test Message
          </Button>
          <Button onClick={clearResults} size="sm" variant="ghost" className="text-gray-400">
            Clear
          </Button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            <h4 className="text-sm font-medium text-gray-300">Test Results:</h4>
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 text-sm p-2 rounded ${
                  result.success ? "bg-green-900/20 text-green-300" : "bg-red-900/20 text-red-300"
                }`}
              >
                {result.success ? (
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <span className="font-medium">[{result.type}]</span> {result.message}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-gray-400 space-y-1">
          <p>
            • <strong>Test Logic:</strong> Kiểm tra logic thời gian và điều kiện nhắc nhở
          </p>
          <p>
            • <strong>Test Connection:</strong> Kiểm tra kết nối với Messenger API
          </p>
          <p>
            • <strong>Send Test Message:</strong> Gửi tin nhắn test thực tế
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
