import { type NextRequest, NextResponse } from "next/server"

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN

export async function POST(request: NextRequest) {
  try {
    const { userId, message } = await request.json()

    if (!userId || !message) {
      return NextResponse.json({ error: "Missing userId or message" }, { status: 400 })
    }

    if (!PAGE_ACCESS_TOKEN) {
      return NextResponse.json({ error: "PAGE_ACCESS_TOKEN not configured" }, { status: 500 })
    }

    const response = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient: { id: userId },
        message: { text: message },
      }),
    })

    if (response.ok) {
      const result = await response.json()
      console.log("✅ Messenger notification sent successfully")
      return NextResponse.json({
        success: true,
        message: "Notification sent successfully",
        messageId: result.message_id,
      })
    } else {
      const errorText = await response.text()
      console.error("❌ Facebook API error:", errorText)
      return NextResponse.json({ error: "Failed to send message" }, { status: 400 })
    }
  } catch (error) {
    console.error("❌ Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
