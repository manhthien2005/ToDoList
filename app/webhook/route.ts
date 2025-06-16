import { type NextRequest, NextResponse } from "next/server"

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "space_mission_verify_2024"
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN
const APP_SECRET = process.env.APP_SECRET

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  console.log("=== 🔐 WEBHOOK VERIFICATION ===")
  console.log("Mode:", mode)
  console.log("Token received:", token)
  console.log("Token expected:", VERIFY_TOKEN)

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified successfully!")
    return new NextResponse(challenge)
  } else {
    console.log("❌ Webhook verification failed")
    console.log("Expected:", VERIFY_TOKEN)
    console.log("Received:", token)
    return new NextResponse("Forbidden", { status: 403 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("=== 📨 INCOMING MESSAGE ===")
    console.log("Full body:", JSON.stringify(body, null, 2))

    if (body.object === "page") {
      body.entry?.forEach((entry: any) => {
        const webhookEvent = entry.messaging?.[0]
        if (webhookEvent) {
          console.log("🆔 USER ID DETECTED:", webhookEvent.sender.id)
          console.log("💬 Message:", webhookEvent.message?.text)

          // Auto-reply with user ID
          if (webhookEvent.message?.text) {
            sendMessage(
              webhookEvent.sender.id,
              `🚀 Space Mission Control Connected!

Xin chào! Tôi đã nhận được tin nhắn: "${webhookEvent.message.text}"

🆔 USER ID của bạn là: ${webhookEvent.sender.id}

📋 Hướng dẫn tiếp theo:
1. Copy User ID này: ${webhookEvent.sender.id}
2. Vào Space Mission Control app
3. Bật "Thông báo Messenger" 
4. Dán User ID vào ô "Facebook User ID"
5. Bạn sẽ nhận được thông báo nhắc nhở!

🌌 Chúc bạn hoàn thành tốt các nhiệm vụ!`,
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
  if (!PAGE_ACCESS_TOKEN) {
    console.error("❌ PAGE_ACCESS_TOKEN not configured!")
    return false
  }

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
      return true
    } else {
      const errorText = await response.text()
      console.error("❌ Failed to send message:", errorText)
      return false
    }
  } catch (error) {
    console.error("❌ Send message error:", error)
    return false
  }
}
