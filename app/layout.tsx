import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Space Mission Control",
  description: "Todo App with Messenger Notifications",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">{children}</body>
    </html>
  )
}
