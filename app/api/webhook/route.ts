import { type NextRequest, NextResponse } from "next/server"

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "space_mission_verify_2024"
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN

// ===== WEBHOOK VERIFICATION (GET) =====
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  console.log("=== 🔐 WEBHOOK VERIFICATION ===")
  console.log("Mode:", mode)
  console.log("Token received:", token)
  console.log("Token expected:", VERIFY_TOKEN)
  console.log("Challenge:", challenge)

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified successfully!")
    return new NextResponse(challenge)
  } else {
    console.log("❌ Webhook verification failed")
    return new NextResponse("Forbidden", { status: 403 })
  }
}

// ===== RECEIVE MESSAGES FROM FACEBOOK (POST) =====
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("=== 📨 INCOMING WEBHOOK EVENT ===")

    if (body.object === "page") {
      console.log("✅ Page event detected")

      if (body.entry && body.entry.length > 0) {
        body.entry.forEach((entry: any) => {
          if (entry.messaging && entry.messaging.length > 0) {
            entry.messaging.forEach((webhookEvent: any) => {
              if (webhookEvent.sender && webhookEvent.sender.id) {
                const senderId = webhookEvent.sender.id
                console.log("🎯 USER ID DETECTED:", senderId)

                // Auto-reply with User ID
                if (webhookEvent.message && webhookEvent.message.text) {
                  console.log("📝 Message received:", webhookEvent.message.text)

                  const welcomeMessage = `🚀 Space Mission Control Connected!

Xin chào! Tôi đã nhận được tin nhắn: "${webhookEvent.message.text}"

🆔 USER ID của bạn là: ${senderId}

📋 Hướng dẫn tiếp theo:
1. Copy User ID này: ${senderId}
2. Vào Space Mission Control app
3. Bật "Thông báo Messenger" 
4. Dán User ID vào ô "Facebook User ID"
5. Bạn sẽ nhận được thông báo nhắc nhở!

🌌 Chúc bạn hoàn thành tốt các nhiệm vụ!`

                  sendMessage(senderId, welcomeMessage)
                }
              }
            })
          }
        })
      }

      return NextResponse.json({ status: "EVENT_RECEIVED" })
    } else {
      return NextResponse.json({ error: "Not a page event" }, { status: 404 })
    }
  } catch (error) {
    console.error("❌ Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ===== SEND MESSAGE FUNCTION =====
async function sendMessage(recipientId: string, message: string) {
  console.log("📤 Sending message to:", recipientId)

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
      console.log("✅ Message sent successfully!")
      return true
    } else {
      const errorText = await response.text()
      console.error("❌ Facebook API Error:", errorText)
      return false
    }
  } catch (error) {
    console.error("❌ Send message error:", error)
    return false
  }
}
