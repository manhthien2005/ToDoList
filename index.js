const express = require("express")
const cors = require("cors")
const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(express.json())
app.use(cors())

// ===== CONFIGURATION =====
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "space_mission_verify_2024"
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN
const APP_SECRET = process.env.APP_SECRET

console.log("🚀 Space Mission Messenger Server Starting...")
console.log("📋 Configuration Check:")
console.log("- Verify Token:", VERIFY_TOKEN)
console.log("- Has Page Token:", !!PAGE_ACCESS_TOKEN)
console.log("- Page Token Preview:", PAGE_ACCESS_TOKEN ? PAGE_ACCESS_TOKEN.substring(0, 20) + "..." : "NOT SET")

// ===== ROOT ENDPOINT =====
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Space Mission Messenger Server",
    status: "ONLINE",
    timestamp: new Date().toISOString(),
    config: {
      hasPageToken: !!PAGE_ACCESS_TOKEN,
      hasAppSecret: !!APP_SECRET,
      verifyToken: VERIFY_TOKEN,
    },
    endpoints: {
      webhook: "/webhook",
      sendMessage: "/send-messenger",
      health: "/health",
    },
  })
})

// ===== WEBHOOK VERIFICATION =====
app.get("/webhook", (req, res) => {
  console.log("\n=== 🔐 WEBHOOK VERIFICATION ===")

  const mode = req.query["hub.mode"]
  const token = req.query["hub.verify_token"]
  const challenge = req.query["hub.challenge"]

  console.log("📝 Request Details:")
  console.log("- Mode:", mode)
  console.log("- Received Token:", token)
  console.log("- Expected Token:", VERIFY_TOKEN)

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ WEBHOOK VERIFIED SUCCESSFULLY!")
    res.status(200).send(challenge)
  } else {
    console.log("❌ WEBHOOK VERIFICATION FAILED!")
    res.sendStatus(403)
  }
})

// ===== RECEIVE MESSAGES FROM FACEBOOK =====
app.post("/webhook", (req, res) => {
  console.log("\n=== 📨 INCOMING WEBHOOK EVENT ===")
  const body = req.body

  if (body.object === "page") {
    console.log("✅ Page event detected")

    if (body.entry && body.entry.length > 0) {
      body.entry.forEach((entry) => {
        if (entry.messaging && entry.messaging.length > 0) {
          entry.messaging.forEach((webhookEvent) => {
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

    res.status(200).send("EVENT_RECEIVED")
  } else {
    res.sendStatus(404)
  }
})

// ===== SEND MESSAGE FUNCTION =====
const sendMessage = async (userId, message) => {
  console.log("\n=== 📤 SENDING MESSAGE ===")
  console.log("👤 To User ID:", userId)
  console.log("🔑 Has Page Token:", !!PAGE_ACCESS_TOKEN)

  if (!PAGE_ACCESS_TOKEN) {
    console.error("❌ PAGE_ACCESS_TOKEN not configured!")
    return false
  }

  const url = `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`

  const payload = {
    recipient: { id: userId },
    message: { text: message },
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const responseText = await response.text()
    console.log("📊 Facebook API Response:")
    console.log("- Status:", response.status)
    console.log("- Response:", responseText)

    if (response.ok) {
      console.log("✅ Message sent successfully!")
      return true
    } else {
      console.error("❌ Facebook API Error:", responseText)
      return false
    }
  } catch (error) {
    console.error("❌ Network Error:", error.message)
    return false
  }
}

// ===== API FOR TODO APP =====
app.post("/send-messenger", async (req, res) => {
  console.log("\n=== 📱 TODO APP MESSAGE REQUEST ===")
  const { userId, message } = req.body

  console.log("👤 User ID:", userId)
  console.log("💬 Message preview:", message ? message.substring(0, 100) + "..." : "No message")

  if (!userId || !message) {
    console.error("❌ Missing userId or message")
    return res.status(400).json({
      error: "Missing userId or message",
      required: { userId: "string", message: "string" },
    })
  }

  if (!PAGE_ACCESS_TOKEN) {
    console.error("❌ PAGE_ACCESS_TOKEN not configured")
    return res.status(500).json({
      error: "Server not configured",
      hint: "Add PAGE_ACCESS_TOKEN environment variable",
    })
  }

  const success = await sendMessage(userId, message)

  if (success) {
    console.log("🎉 Message sent successfully from TODO APP!")
    res.json({
      success: true,
      message: "Tin nhắn đã được gửi thành công!",
      timestamp: new Date().toISOString(),
    })
  } else {
    console.log("💥 Failed to send message from TODO APP")
    res.status(500).json({
      success: false,
      error: "Failed to send message",
      hint: "Check server logs for details",
    })
  }
})

// ===== HEALTH CHECK =====
app.get("/health", (req, res) => {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    config: {
      verifyToken: VERIFY_TOKEN,
      hasPageToken: !!PAGE_ACCESS_TOKEN,
      hasAppSecret: !!APP_SECRET,
    },
  }

  console.log("🏥 Health check requested")
  res.json(health)
})

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log("\n🚀 SPACE MISSION MESSENGER SERVER ONLINE!")
  console.log("=".repeat(50))
  console.log(`📡 Server running on port: ${PORT}`)
  console.log(`🔑 Verify Token: ${VERIFY_TOKEN}`)
  console.log("=".repeat(50))
})

module.exports = app
