const express = require("express")
const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(express.json())

// QUAN TRỌNG: Thay đổi token này thành chuỗi của bạn
const VERIFY_TOKEN = "space_mission_verify_token_123"

// Webhook verification - Facebook sẽ gọi endpoint này
app.get("/webhook", (req, res) => {
  console.log("Webhook verification request received")

  const mode = req.query["hub.mode"]
  const token = req.query["hub.verify_token"]
  const challenge = req.query["hub.challenge"]

  console.log("Mode:", mode)
  console.log("Token:", token)
  console.log("Expected token:", VERIFY_TOKEN)

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified successfully!")
    res.status(200).send(challenge)
  } else {
    console.log("❌ Webhook verification failed")
    res.sendStatus(403)
  }
})

// Receive messages from Facebook
app.post("/webhook", (req, res) => {
  const body = req.body
  console.log("Received webhook:", JSON.stringify(body, null, 2))

  if (body.object === "page") {
    body.entry.forEach((entry) => {
      const webhookEvent = entry.messaging[0]
      console.log("Message received:", webhookEvent)
    })
    res.status(200).send("EVENT_RECEIVED")
  } else {
    res.sendStatus(404)
  }
})

// Test endpoint
app.get("/", (req, res) => {
  res.send("🚀 Messenger Bot Server is running!")
})

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`Webhook URL will be: https://your-domain.vercel.app/webhook`)
  console.log(`Verify token: ${VERIFY_TOKEN}`)
})
