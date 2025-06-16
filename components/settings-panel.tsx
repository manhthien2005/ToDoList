"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Clock, MessageCircle } from "lucide-react"
import type { Settings } from "../types/todo"

interface SettingsPanelProps {
  settings: Settings
  onSettingsChange: (settings: Partial<Settings>) => void
}

export function SettingsPanel({ settings, onSettingsChange }: SettingsPanelProps) {
  return (
    <div className="bg-slate-800/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-slate-600/50 mb-6 space-y-4">
      {/* Reset Time */}
      <div className="flex items-center gap-3">
        <Clock className="w-5 h-5 text-blue-400" />
        <Label htmlFor="reset-time" className="text-gray-200 font-medium">
          Thời gian reset hàng ngày:
        </Label>
        <Input
          id="reset-time"
          type="time"
          value={settings.resetTime}
          onChange={(e) => onSettingsChange({ resetTime: e.target.value })}
          className="w-32 rounded-xl border-slate-600 focus:border-blue-400 bg-slate-700/50 text-gray-200"
        />
      </div>

      {/* Messenger Notifications */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-5 h-5 text-purple-400" />
          <Label className="text-gray-200 font-medium">Thông báo Messenger</Label>
          <Switch
            checked={settings.enableMessengerNotifications}
            onCheckedChange={(checked) => onSettingsChange({ enableMessengerNotifications: checked })}
          />
        </div>

        {settings.enableMessengerNotifications && (
          <div className="ml-8 space-y-2">
            <Label htmlFor="messenger-id" className="text-gray-300 text-sm">
              Facebook User ID:
            </Label>
            <Input
              id="messenger-id"
              placeholder="Nhập Facebook User ID của bạn"
              value={settings.messengerUserId || ""}
              onChange={(e) => onSettingsChange({ messengerUserId: e.target.value })}
              className="rounded-xl border-slate-600 focus:border-purple-400 bg-slate-700/50 text-gray-200"
            />
            <p className="text-xs text-gray-400">Cách lấy User ID: Nhắn tin cho bot, check logs để lấy sender.id</p>
          </div>
        )}
      </div>
    </div>
  )
}
