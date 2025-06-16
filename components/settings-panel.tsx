"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock } from "lucide-react"

interface SettingsPanelProps {
  resetTime: string
  onResetTimeChange: (time: string) => void
}

export function SettingsPanel({ resetTime, onResetTimeChange }: SettingsPanelProps) {
  return (
    <div className="bg-slate-800/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-slate-600/50 mb-6">
      <div className="flex items-center gap-3">
        <Clock className="w-5 h-5 text-blue-400" />
        <Label htmlFor="reset-time" className="text-gray-200 font-medium">
          Thời gian reset hàng ngày:
        </Label>
        <Input
          id="reset-time"
          type="time"
          value={resetTime}
          onChange={(e) => onResetTimeChange(e.target.value)}
          className="w-32 rounded-xl border-slate-600 focus:border-blue-400 bg-slate-700/50 text-gray-200"
        />
      </div>
    </div>
  )
}
