import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    status: "online",
    timestamp: new Date().toISOString(),
    config: {
      hasPageToken: !!process.env.PAGE_ACCESS_TOKEN,
      hasVerifyToken: !!process.env.VERIFY_TOKEN,
      hasAppSecret: !!process.env.APP_SECRET,
    },
  })
}
