"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Clock, MessageCircle, Info } from "lucide-react"
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
            <div className="flex items-start gap-2 text-xs text-gray-400 bg-slate-700/30 rounded-lg p-3">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-300 mb-1">Cách lấy User ID:</p>
                <ol className="space-y-1 ml-4 list-decimal">
                  <li>Nhắn tin "hello" vào Facebook Page của bot</li>
                  <li>Bot sẽ trả lời kèm User ID của bạn</li>
                  <li>Copy User ID và paste vào ô trên</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
