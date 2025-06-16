import { NextResponse } from "next/server"

export async function GET() {
  const config = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    verifyToken: process.env.VERIFY_TOKEN || "space_mission_verify_2024",
    config: {
      hasPageToken: !!process.env.PAGE_ACCESS_TOKEN,
      hasVerifyToken: !!process.env.VERIFY_TOKEN,
      hasAppSecret: !!process.env.APP_SECRET,
      pageTokenPreview: process.env.PAGE_ACCESS_TOKEN
        ? process.env.PAGE_ACCESS_TOKEN.substring(0, 20) + "..."
        : "NOT SET",
    },
  }

  console.log("🏥 Health check:", config)
  return NextResponse.json(config)
}
