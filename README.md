# 🚀 Space Mission Control

Complete Todo App with Messenger Notifications

## 🏗️ Architecture

\`\`\`
space-mission-control/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # 🎨 Frontend - Todo App UI
│   ├── layout.tsx               # Layout wrapper
│   ├── globals.css              # Global styles
│   └── api/                     # 🔧 Backend API Routes
│       ├── route.ts             # Server info endpoint
│       ├── webhook/route.ts     # Facebook webhook handler
│       ├── send-messenger/route.ts # Send notifications
│       └── health/route.ts      # Health check
├── package.json                 # Dependencies
├── next.config.js              # Next.js config
├── tailwind.config.ts          # Tailwind config
└── README.md                   # This file
\`\`\`

## 🚀 Deploy Instructions

### 1. Deploy to Vercel
\`\`\`bash
npm install
vercel --prod
\`\`\`

### 2. Add Environment Variables on Vercel
- `VERIFY_TOKEN`: space_mission_verify_2024
- `PAGE_ACCESS_TOKEN`: (from Facebook Page)
- `APP_SECRET`: (from Facebook App)

### 3. Configure Facebook Webhook
- Callback URL: `https://your-app.vercel.app/api/webhook`
- Verify Token: `space_mission_verify_2024`

### 4. Test the App
1. Visit: `https://your-app.vercel.app`
2. Send message to Facebook Page to get User ID
3. Enter User ID in app settings
4. Add todos and receive notifications!

## 📱 Features

### Frontend (/)
- ✅ Beautiful Todo App UI
- 🎨 Space theme with gradients
- 📱 Responsive design
- ⚙️ Settings panel for notifications
- 🧪 Test notification button

### Backend (/api/*)
- 🔗 `/api/webhook` - Facebook webhook handler
- 📤 `/api/send-messenger` - Send notifications
- 🏥 `/api/health` - Health check
- ℹ️ `/api/` - Server info

## 🔧 How It Works

1. **User adds todo** → Frontend calls `/api/send-messenger`
2. **API sends notification** → Facebook Messenger
3. **User completes todo** → Another notification sent
4. **Facebook sends message** → `/api/webhook` handles it
5. **Auto-reply with User ID** → User copies ID to app

Perfect! 🌟
