const express = require("express")
const cors = require("cors")
const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(express.json())
app.use(cors())

// ===== CẤU HÌNH FACEBOOK - THAY ĐỔI CÁC GIÁ TRỊ NÀY =====
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "your_verify_token_123"
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN || "YOUR_PAGE_ACCESS_TOKEN_HERE"
const APP_SECRET = process.env.APP_SECRET || "YOUR_APP_SECRET_HERE"

console.log("🔧 Server Configuration:")
console.log("- Verify Token:", VERIFY_TOKEN)
console.log("- Has Page Token:", !!PAGE_ACCESS_TOKEN && PAGE_ACCESS_TOKEN !== "YOUR_PAGE_ACCESS_TOKEN_HERE")
console.log("- Has App Secret:", !!APP_SECRET && APP_SECRET !== "YOUR_APP_SECRET_HERE")

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Messenger Webhook Server đang chạy!",
    status: "OK",
    timestamp: new Date().toISOString(),
    config: {
      hasPageToken: !!PAGE_ACCESS_TOKEN && PAGE_ACCESS_TOKEN !== "YOUR_PAGE_ACCESS_TOKEN_HERE",
      hasAppSecret: !!APP_SECRET && APP_SECRET !== "YOUR_APP_SECRET_HERE",
      verifyToken: VERIFY_TOKEN,
    },
  })
})

// ===== WEBHOOK VERIFICATION =====
app.get("/webhook", (req, res) => {
  console.log("=== WEBHOOK VERIFICATION REQUEST ===")
  console.log("Query params:", req.query)

  const mode = req.query["hub.mode"]
  const token = req.query["hub.verify_token"]
  const challenge = req.query["hub.challenge"]

  console.log("Mode:", mode)
  console.log("Token received:", token)
  console.log("Token expected:", VERIFY_TOKEN)
  console.log("Challenge:", challenge)

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified successfully!")
    res.status(200).send(challenge)
  } else {
    console.log("❌ Webhook verification failed")
    console.log("- Mode check:", mode === "subscribe")
    console.log("- Token check:", token === VERIFY_TOKEN)
    res.sendStatus(403)
  }
})

// ===== NHẬN TIN NHẮN TỪ FACEBOOK =====
app.post("/webhook", (req, res) => {
  console.log("=== INCOMING WEBHOOK EVENT ===")
  const body = req.body
  console.log("Body:", JSON.stringify(body, null, 2))

  if (body.object === "page") {
    body.entry.forEach((entry) => {
      const webhookEvent = entry.messaging[0]
      console.log("Webhook event:", webhookEvent)

      if (webhookEvent.sender) {
        const senderId = webhookEvent.sender.id
        console.log("🆔 SENDER ID (User ID):", senderId)
        console.log("👆 Copy ID này để điền vào todo app!")

        // Auto reply để confirm
        if (webhookEvent.message) {
          sendMessage(
            senderId,
            `🚀 Xin chào! Tôi đã nhận được tin nhắn của bạn. 

User ID của bạn là: ${senderId}

Hãy copy ID này và điền vào Space Mission Control app để nhận thông báo nhắc nhở!`,
          )
        }
      }
    })

    res.status(200).send("EVENT_RECEIVED")
  } else {
    console.log("❌ Not a page event")
    res.sendStatus(404)
  }
})

// ===== FUNCTION GỬI TIN NHẮN =====
const sendMessage = async (userId, message) => {
  if (!PAGE_ACCESS_TOKEN || PAGE_ACCESS_TOKEN === "YOUR_PAGE_ACCESS_TOKEN_HERE") {
    console.error("❌ PAGE_ACCESS_TOKEN chưa được cấu hình!")
    return false
  }

  const url = `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`

  const payload = {
    recipient: { id: userId },
    message: { text: message },
  }

  console.log("📤 Sending message to Facebook API...")
  console.log("URL:", url)
  console.log("Payload:", JSON.stringify(payload, null, 2))

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const responseData = await response.text()
    console.log("📊 Facebook API Response:")
    console.log("Status:", response.status)
    console.log("Data:", responseData)

    if (response.ok) {
      console.log("✅ Message sent successfully!")
      return true
    } else {
      console.error("❌ Failed to send message:")
      console.error("Status:", response.status)
      console.error("Response:", responseData)
      return false
    }
  } catch (error) {
    console.error("❌ Network error:", error)
    return false
  }
}

// ===== API ENDPOINT CHO TODO APP =====
app.post("/send-messenger", async (req, res) => {
  console.log("=== SEND MESSAGE REQUEST FROM TODO APP ===")
  const { userId, message } = req.body

  console.log("User ID:", userId)
  console.log("Message:", message)

  // Validation
  if (!userId || !message) {
    console.error("❌ Missing userId or message")
    return res.status(400).json({ error: "Thiếu userId hoặc message" })
  }

  if (!PAGE_ACCESS_TOKEN || PAGE_ACCESS_TOKEN === "YOUR_PAGE_ACCESS_TOKEN_HERE") {
    console.error("❌ PAGE_ACCESS_TOKEN not configured")
    return res.status(500).json({ error: "Server chưa cấu hình PAGE_ACCESS_TOKEN" })
  }

  // Send message
  const success = await sendMessage(userId, message)

  if (success) {
    res.json({
      success: true,
      message: "Tin nhắn đã được gửi thành công!",
      timestamp: new Date().toISOString(),
    })
  } else {
    res.status(500).json({
      success: false,
      error: "Không thể gửi tin nhắn. Kiểm tra logs để biết chi tiết.",
    })
  }
})

// ===== TEST ENDPOINT =====
app.post("/test-send", async (req, res) => {
  const { userId } = req.body
  const testMessage = "🧪 Test message từ Space Mission Control server!"

  console.log("=== TEST SEND MESSAGE ===")
  console.log("Test User ID:", userId)

  if (!userId) {
    return res.status(400).json({ error: "Cần userId để test" })
  }

  const success = await sendMessage(userId, testMessage)
  res.json({ success, message: success ? "Test thành công!" : "Test thất bại" })
})

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    config: {
      verifyToken: VERIFY_TOKEN,
      hasPageToken: !!PAGE_ACCESS_TOKEN && PAGE_ACCESS_TOKEN !== "YOUR_PAGE_ACCESS_TOKEN_HERE",
      hasAppSecret: !!APP_SECRET && APP_SECRET !== "YOUR_APP_SECRET_HERE",
    },
  })
})

// Error handling
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err)
  res.status(500).json({ error: "Internal server error" })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📝 Webhook URL: https://your-domain.vercel.app/webhook`)
  console.log(`🔑 Verify Token: ${VERIFY_TOKEN}`)
  console.log(`🏥 Health Check: https://your-domain.vercel.app/health`)
  console.log(`🧪 Test Endpoint: POST /test-send`)
})
