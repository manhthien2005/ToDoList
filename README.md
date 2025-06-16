# Space Mission Messenger Server

## Setup Instructions

### 1. Deploy to Vercel
\`\`\`bash
npm install
vercel
\`\`\`

### 2. Add Environment Variables on Vercel
- `VERIFY_TOKEN`: space_mission_verify_2024
- `PAGE_ACCESS_TOKEN`: (get from Facebook Page)
- `APP_SECRET`: (get from Facebook App)

### 3. Configure Facebook Webhook
- Callback URL: https://your-server.vercel.app/webhook
- Verify Token: space_mission_verify_2024

### 4. Test
- Send message to Facebook Page
- Check logs for User ID
- Use User ID in Todo App

## Endpoints
- GET `/` - Server info
- GET `/webhook` - Facebook verification
- POST `/webhook` - Receive messages
- POST `/send-messenger` - Send messages
- POST `/test-send` - Test messaging
- GET `/health` - Health check
