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
    console.log("Expected token:", VERIFY_TOKEN)
    console.log("Received token:", token)
    return new NextResponse("Forbidden", { status: 403 })
  }
}

// ===== RECEIVE MESSAGES FROM FACEBOOK (POST) =====
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("=== 📨 INCOMING WEBHOOK EVENT ===")
    console.log("Full body:", JSON.stringify(body, null, 2))

    if (body.object === "page") {
      console.log("✅ Page event detected")

      if (body.entry && body.entry.length > 0) {
        body.entry.forEach((entry: any) => {
          console.log("Processing entry:", JSON.stringify(entry, null, 2))

          if (entry.messaging && entry.messaging.length > 0) {
            entry.messaging.forEach((webhookEvent: any) => {
              console.log("Processing messaging event:", JSON.stringify(webhookEvent, null, 2))

              if (webhookEvent.sender && webhookEvent.sender.id) {
                const senderId = webhookEvent.sender.id
                console.log("🎯 USER ID DETECTED:", senderId)
                console.log("🆔 COPY THIS ID FOR YOUR TODO APP!")
                console.log("=".repeat(50))

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

                  console.log("📤 Attempting to send welcome message...")
                  sendMessage(senderId, welcomeMessage)
                } else {
                  console.log("ℹ️ No text message found in webhook event")
                }
              } else {
                console.log("⚠️ No sender ID found in webhook event")
              }
            })
          } else {
            console.log("⚠️ No messaging array found in entry")
          }
        })
      } else {
        console.log("⚠️ No entry array found in body")
      }

      return NextResponse.json({ status: "EVENT_RECEIVED" })
    } else {
      console.log("❌ Not a page event, object:", body.object)
      return NextResponse.json({ error: "Not a page event" }, { status: 404 })
    }
  } catch (error) {
    console.error("❌ Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ===== SEND MESSAGE FUNCTION =====
async function sendMessage(recipientId: string, message: string) {
  console.log("\n=== 📤 SENDING MESSAGE ===")
  console.log("👤 To User ID:", recipientId)
  console.log("💬 Message length:", message.length)
  console.log("🔑 Has Page Token:", !!PAGE_ACCESS_TOKEN)

  if (!PAGE_ACCESS_TOKEN) {
    console.error("❌ PAGE_ACCESS_TOKEN not configured!")
    return false
  }

  const url = `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`

  const payload = {
    recipient: { id: recipientId },
    message: { text: message },
  }

  console.log("🌐 Facebook API URL:", url.replace(PAGE_ACCESS_TOKEN, "***TOKEN***"))
  console.log("📦 Payload:", JSON.stringify(payload, null, 2))

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Space-Mission-Bot/1.0",
      },
      body: JSON.stringify(payload),
    })

    const responseText = await response.text()
    console.log("📊 Facebook API Response:")
    console.log("- Status:", response.status)
    console.log("- Status Text:", response.statusText)
    console.log("- Response:", responseText)

    if (response.ok) {
      console.log("✅ Message sent successfully!")
      return true
    } else {
      console.error("❌ Facebook API Error:")
      console.error("Status:", response.status)
      console.error("Response:", responseText)
      return false
    }
  } catch (error) {
    console.error("❌ Network Error:", error)
    return false
  }
}
