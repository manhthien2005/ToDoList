import { type NextRequest, NextResponse } from "next/server"

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    console.log("=== 🧪 TEST MESSAGE ===")
    console.log("👤 Test User ID:", userId)

    if (!userId) {
      return NextResponse.json({ error: "userId required for testing" }, { status: 400 })
    }

    if (!PAGE_ACCESS_TOKEN) {
      return NextResponse.json({ error: "PAGE_ACCESS_TOKEN not configured" }, { status: 500 })
    }

    const testMessage = `🧪 TEST MESSAGE từ Space Mission Control!

Thời gian: ${new Date().toLocaleString("vi-VN")}
Verify Token: space_mission_verify_2024

Nếu bạn nhận được tin nhắn này, nghĩa là hệ thống đã hoạt động hoàn hảo! 🚀

✅ Backend server: ONLINE
✅ Facebook integration: WORKING
✅ Messenger notifications: READY

Bây giờ bạn có thể sử dụng Todo App với thông báo Messenger! 🌟`

    const response = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient: { id: userId },
        message: { text: testMessage },
      }),
    })

    if (response.ok) {
      const result = await response.json()
      console.log("✅ Test message sent successfully!")
      return NextResponse.json({
        success: true,
        message: "✅ Test thành công! Check your Messenger!",
        messageId: result.message_id,
        timestamp: new Date().toISOString(),
      })
    } else {
      const errorText = await response.text()
      console.error("❌ Test failed:", errorText)
      return NextResponse.json(
        {
          success: false,
          error: "Failed to send test message",
          details: errorText,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("❌ Test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
