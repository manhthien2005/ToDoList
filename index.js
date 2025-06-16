const express = require("express")
const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(express.json())

// QUAN TRỌNG: Token này phải khớp với Facebook
const VERIFY_TOKEN = "space_mission_verify_token_123"

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Messenger Bot Server is running!",
    status: "OK",
    timestamp: new Date().toISOString(),
  })
})

// Webhook verification - Facebook sẽ gọi endpoint này
app.get("/webhook", (req, res) => {
  console.log("=== Webhook Verification ===")
  console.log("Query params:", req.query)

  const mode = req.query["hub.mode"]
  const token = req.query["hub.verify_token"]
  const challenge = req.query["hub.challenge"]

  console.log("Mode:", mode)
  console.log("Received token:", token)
  console.log("Expected token:", VERIFY_TOKEN)

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("✅ Webhook verified successfully!")
    res.status(200).send(challenge)
  } else {
    console.log("❌ Webhook verification failed")
    console.log("Mode check:", mode === "subscribe")
    console.log("Token check:", token === VERIFY_TOKEN)
    res.sendStatus(403)
  }
})

// Receive messages from Facebook
app.post("/webhook", (req, res) => {
  console.log("=== Incoming Message ===")
  const body = req.body

  if (body.object === "page") {
    body.entry.forEach((entry) => {
      const webhookEvent = entry.messaging[0]
      console.log("Message received:", webhookEvent)

      // Lưu user ID để gửi tin nhắn sau
      if (webhookEvent.sender) {
        console.log("User ID:", webhookEvent.sender.id)
      }
    })
    res.status(200).send("EVENT_RECEIVED")
  } else {
    console.log("Not a page event")
    res.sendStatus(404)
  }
})

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    verifyToken: VERIFY_TOKEN,
  })
})

// Test endpoint để gửi tin nhắn
app.post("/send-test", (req, res) => {
  console.log("Test send request:", req.body)
  res.json({ message: "Test endpoint working" })
})

// Error handling
app.use((err, req, res, next) => {
  console.error("Error:", err)
  res.status(500).json({ error: "Internal server error" })
})

// 404 handler
app.use((req, res) => {
  console.log("404 - Route not found:", req.path)
  res.status(404).json({ error: "Route not found" })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
  console.log(`Webhook endpoint: /webhook`)
  console.log(`Verify token: ${VERIFY_TOKEN}`)
})
