import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "🚀 Space Mission Control API",
    status: "ONLINE",
    timestamp: new Date().toISOString(),
    verifyToken: "space_mission_verify_2024",
    config: {
      hasPageToken: !!process.env.PAGE_ACCESS_TOKEN,
      hasAppSecret: !!process.env.APP_SECRET,
      hasVerifyToken: !!process.env.VERIFY_TOKEN,
    },
    endpoints: {
      webhook: "/api/webhook",
      sendMessage: "/api/send-messenger",
      health: "/api/health",
    },
    frontend: {
      todoApp: "/",
      description: "Beautiful Todo App with Messenger notifications",
    },
    instructions: [
      "1. Visit / for the Todo App",
      "2. Visit /api for API info",
      "3. Configure Facebook webhook at /api/webhook",
      "4. Use verify token: space_mission_verify_2024",
    ],
  })
}
