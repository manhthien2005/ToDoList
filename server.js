const express = require("express")
const cors = require("cors")
const fetch = require("node-fetch") // Add this line
const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(express.json())
app.use(cors())

// ===== CẤU HÌNH FACEBOOK =====
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "space_mission_verify_2024"
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN
const APP_SECRET = process.env.APP_SECRET

console.log("🔧 Server Configuration:")
console.log("- Verify Token:", VERIFY_TOKEN)
console.log("- Has Page Token:", !!PAGE_ACCESS_TOKEN)
console.log("- Has App Secret:", !!APP_SECRET)

// Root endpoint
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
  })
})

// ===== WEBHOOK VERIFICATION =====
app.get("/webhook", (req, res) => {
  console.log("=== WEBHOOK VERIFICATION ===")

  const mode = req.query["hub.mode"]
  const token = req.query["hub.verify_token"]
  const challenge = req.query["hub.challenge"]

  console.log("Mode:", mode)
  console.log("Token received:", token)
  console.log("Token expected:", VERIFY_TOKEN)

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified!")
    res.status(200).send(challenge)
  } else {
    console.log("❌ Verification failed")
    res.sendStatus(403)
  }
})

// ===== RECEIVE MESSAGES =====
app.post("/webhook", (req, res) => {
  console.log("=== INCOMING MESSAGE ===")
  const body = req.body

  if (body.object === "page") {
    body.entry?.forEach((entry) => {
      const webhookEvent = entry.messaging?.[0]

      if (webhookEvent?.sender?.id) {
        const senderId = webhookEvent.sender.id
        console.log("🆔 USER ID:", senderId)

        if (webhookEvent.message?.text) {
          console.log("💬 Message:", webhookEvent.message.text)

          // Auto-reply
          sendMessage(
            senderId,
            `🚀 Space Mission Control!

User ID của bạn: ${senderId}

Copy ID này và điền vào Todo App để nhận thông báo! 🌟`,
          )
        }
      }
    })

    res.status(200).send("EVENT_RECEIVED")
  } else {
    res.sendStatus(404)
  }
})

// ===== SEND MESSAGE FUNCTION =====
const sendMessage = async (userId, message) => {
  if (!PAGE_ACCESS_TOKEN) {
    console.error("❌ No PAGE_ACCESS_TOKEN")
    return false
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { id: userId },
        message: { text: message },
      }),
    })

    if (response.ok) {
      console.log("✅ Message sent!")
      return true
    } else {
      const error = await response.text()
      console.error("❌ Send failed:", error)
      return false
    }
  } catch (error) {
    console.error("❌ Network error:", error)
    return false
  }
}

// ===== API FOR TODO APP =====
app.post("/send-messenger", async (req, res) => {
  const { userId, message } = req.body

  if (!userId || !message) {
    return res.status(400).json({ error: "Missing userId or message" })
  }

  const success = await sendMessage(userId, message)

  if (success) {
    res.json({ success: true, message: "Sent successfully!" })
  } else {
    res.status(500).json({ success: false, error: "Failed to send" })
  }
})

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    config: {
      hasPageToken: !!PAGE_ACCESS_TOKEN,
      hasAppSecret: !!APP_SECRET,
      verifyToken: VERIFY_TOKEN,
    },
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})

module.exports = app
