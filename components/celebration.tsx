"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface CelebrationProps {
  show: boolean
  onClose: () => void
}

export function Celebration({ show, onClose }: CelebrationProps) {
  const [step, setStep] = useState(1)

  useEffect(() => {
    if (show) {
      setStep(1)

      const timer1 = setTimeout(() => setStep(2), 1500)
      const timer2 = setTimeout(() => setStep(3), 3000)
      const timer3 = setTimeout(() => setStep(4), 4500)
      const timer4 = setTimeout(() => onClose(), 7000)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
        clearTimeout(timer4)
      }
    }
  }, [show, onClose])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex items-center justify-center">
      <Button
        onClick={onClose}
        className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white z-10"
        size="sm"
      >
        Bỏ qua ✕
      </Button>

      <div className="relative w-full h-full flex items-center justify-center">
        {step === 1 && (
          <div className="text-center">
            <div className="text-8xl mb-4 animate-bounce">🚀</div>
            <p className="text-white text-xl">Chuẩn bị khởi hành...</p>
          </div>
        )}

        {step === 2 && (
          <div className="text-center">
            <div className="text-8xl mb-4 animate-pulse">🚀</div>
            <p className="text-white text-xl">Đang bay lên không gian...</p>
          </div>
        )}

        {step === 3 && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="text-6xl">🚀</div>
              <div className="text-8xl">🌙</div>
            </div>
            <p className="text-white text-xl">Đã đáp xuống mặt trăng!</p>
          </div>
        )}

        {step === 4 && (
          <div className="text-center bg-slate-800 p-8 rounded-2xl border border-blue-500 max-w-md">
            <div className="text-6xl mb-4">🧑‍🚀</div>
            <div className="text-4xl mb-4">🏁</div>
            <h2 className="text-3xl font-bold text-blue-400 mb-4">Nhiệm vụ hoàn thành!</h2>
            <p className="text-gray-300 mb-6">Bạn đã chinh phục được tất cả mục tiêu!</p>
            <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2">
              Tiếp tục 🚀
            </Button>
          </div>
        )}

        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
