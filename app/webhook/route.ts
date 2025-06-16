import { type NextRequest, NextResponse } from "next/server"

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "space_mission_verify_token_123"
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN
const APP_SECRET = process.env.APP_SECRET

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified successfully!")
    return new NextResponse(challenge)
  } else {
    console.log("❌ Webhook verification failed")
    return new NextResponse("Forbidden", { status: 403 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (body.object === "page") {
      body.entry?.forEach((entry: any) => {
        const webhookEvent = entry.messaging?.[0]
        if (webhookEvent) {
          console.log("📨 Received message from:", webhookEvent.sender.id)
          console.log("💬 Message:", webhookEvent.message?.text)

          // Auto-reply with user ID
          if (webhookEvent.message?.text) {
            sendMessage(
              webhookEvent.sender.id,
              `🚀 Space Mission Control đã nhận tin nhắn!

👤 User ID của bạn là: ${webhookEvent.sender.id}

Hãy copy User ID này và paste vào ứng dụng Todo để nhận thông báo! 🌟`,
            )
          }
        }
      })
    }

    return NextResponse.json({ status: "ok" })
  } catch (error) {
    console.error("❌ Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function sendMessage(recipientId: string, message: string) {
  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text: message },
      }),
    })

    if (response.ok) {
      console.log("✅ Message sent successfully")
    } else {
      console.error("❌ Failed to send message:", await response.text())
    }
  } catch (error) {
    console.error("❌ Send message error:", error)
  }
}
