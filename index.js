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
console.log("- Has App Secret:", !!APP_SECRET)
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
      test: "/test-send",
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
  console.log("- Challenge:", challenge)

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ WEBHOOK VERIFIED SUCCESSFULLY!")
    console.log("🎉 Facebook can now send events to this server")
    res.status(200).send(challenge)
  } else {
    console.log("❌ WEBHOOK VERIFICATION FAILED!")
    console.log("💡 Check if VERIFY_TOKEN matches in Facebook Developer Console")
    res.sendStatus(403)
  }
})

// ===== RECEIVE MESSAGES FROM FACEBOOK =====
app.post("/webhook", (req, res) => {
  console.log("\n=== 📨 INCOMING WEBHOOK EVENT ===")
  console.log("Full request body:", JSON.stringify(req.body, null, 2))

  const body = req.body

  if (body.object === "page") {
    console.log("✅ Page event detected")

    if (body.entry && body.entry.length > 0) {
      body.entry.forEach((entry) => {
        console.log("Processing entry:", JSON.stringify(entry, null, 2))

        if (entry.messaging && entry.messaging.length > 0) {
          entry.messaging.forEach((webhookEvent) => {
            console.log("Processing messaging event:", JSON.stringify(webhookEvent, null, 2))

            if (webhookEvent.sender && webhookEvent.sender.id) {
              const senderId = webhookEvent.sender.id
              console.log("🎯 USER ID DETECTED:", senderId)
              console.log("🆔 COPY THIS ID FOR YOUR TODO APP!")
              console.log("=" * 50)

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

    res.status(200).send("EVENT_RECEIVED")
  } else {
    console.log("❌ Not a page event, object:", body.object)
    res.sendStatus(404)
  }
})

// ===== SEND MESSAGE FUNCTION =====
const sendMessage = async (userId, message) => {
  console.log("\n=== 📤 SENDING MESSAGE ===")
  console.log("👤 To User ID:", userId)
  console.log("💬 Message length:", message.length)
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

      // Try to parse error details
      try {
        const errorData = JSON.parse(responseText)
        console.error("Error details:", JSON.stringify(errorData, null, 2))
      } catch (e) {
        console.error("Could not parse error response as JSON")
      }

      return false
    }
  } catch (error) {
    console.error("❌ Network Error:", error.message)
    console.error("Error stack:", error.stack)
    return false
  }
}

// ===== API FOR TODO APP =====
app.post("/send-messenger", async (req, res) => {
  console.log("\n=== 📱 TODO APP MESSAGE REQUEST ===")
  const { userId, message } = req.body

  console.log("👤 User ID:", userId)
  console.log("💬 Message:", message)

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

// ===== TEST ENDPOINT =====
app.post("/test-send", async (req, res) => {
  console.log("\n=== 🧪 TEST MESSAGE ===")
  const { userId } = req.body

  if (!userId) {
    return res.status(400).json({ error: "userId required for testing" })
  }

  const testMessage = `🧪 TEST MESSAGE từ Space Mission Control!

Thời gian: ${new Date().toLocaleString("vi-VN")}

Nếu bạn nhận được tin nhắn này, nghĩa là hệ thống đã hoạt động hoàn hảo! 🚀`

  const success = await sendMessage(userId, testMessage)

  res.json({
    success,
    message: success ? "✅ Test thành công!" : "❌ Test thất bại",
    timestamp: new Date().toISOString(),
  })
})

// ===== HEALTH CHECK =====
app.get("/health", (req, res) => {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    config: {
      verifyToken: VERIFY_TOKEN,
      hasPageToken: !!PAGE_ACCESS_TOKEN,
      hasAppSecret: !!APP_SECRET,
      pageTokenPreview: PAGE_ACCESS_TOKEN ? PAGE_ACCESS_TOKEN.substring(0, 20) + "..." : "NOT SET",
    },
    memory: process.memoryUsage(),
  }

  console.log("🏥 Health check requested")
  res.json(health)
})

// ===== ERROR HANDLING =====
app.use((err, req, res, next) => {
  console.error("💥 Server Error:", err)
  res.status(500).json({
    error: "Internal server error",
    timestamp: new Date().toISOString(),
  })
})

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log("\n🚀 SPACE MISSION MESSENGER SERVER ONLINE!")
  console.log("=" * 50)
  console.log(`📡 Server running on port: ${PORT}`)
  console.log(`🌐 Webhook URL: https://your-domain.vercel.app/webhook`)
  console.log(`🔑 Verify Token: ${VERIFY_TOKEN}`)
  console.log(`🏥 Health Check: https://your-domain.vercel.app/health`)
  console.log("=" * 50)
  console.log("\n📋 Next Steps:")
  console.log("1. Deploy this server to Vercel")
  console.log("2. Add environment variables")
  console.log("3. Configure Facebook webhook")
  console.log("4. Test by sending a message to your Facebook Page")
  console.log("\n🎯 Ready for Space Mission Control!")
})
