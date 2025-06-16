import { type NextRequest, NextResponse } from "next/server"

// Mock API endpoint để test - thay thế bằng server thật sau
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, message } = body

    console.log("=== MOCK MESSENGER API ===")
    console.log("User ID:", userId)
    console.log("Message:", message)

    // Giả lập gửi tin nhắn thành công
    // Trong thực tế, đây sẽ gọi Facebook Graph API

    // Kiểm tra có đủ thông tin không
    if (!userId || !message) {
      return NextResponse.json({ error: "Thiếu userId hoặc message" }, { status: 400 })
    }

    // Giả lập delay như API thật
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock response thành công
    console.log("✅ Mock: Tin nhắn đã được 'gửi' thành công")

    return NextResponse.json({
      success: true,
      message: "Tin nhắn đã được gửi (MOCK)",
      data: {
        userId,
        messageLength: message.length,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("❌ Lỗi trong mock API:", error)
    return NextResponse.json({ error: "Lỗi server nội bộ" }, { status: 500 })
  }
}

// Hỗ trợ OPTIONS cho CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
