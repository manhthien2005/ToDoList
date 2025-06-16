import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "🚀 Space Mission Messenger Server",
    status: "ONLINE",
    timestamp: new Date().toISOString(),
    verifyToken: "space_mission_verify_2024",
    config: {
      hasPageToken: !!process.env.PAGE_ACCESS_TOKEN,
      hasAppSecret: !!process.env.APP_SECRET,
      hasVerifyToken: !!process.env.VERIFY_TOKEN,
    },
    endpoints: {
      webhook: "/webhook",
      sendMessage: "/send-messenger",
      health: "/health",
    },
    instructions: [
      "1. Add environment variables on Vercel",
      "2. Configure Facebook webhook with this URL + /webhook",
      "3. Use verify token: space_mission_verify_2024",
      "4. Send message to Facebook Page to get User ID",
      "5. Use User ID in Todo App settings",
    ],
  })
}
