# 💬 Full-Stack Real-Time Chat Clone (MERN + Socket.IO)

> **Status:** ✅ **100% Ready to Use — All 17 Automated Tests Passed!**

A full-featured, modern real-time messaging application with instant Socket.IO communication, JWT authentication, persistent storage (MongoDB + In-Memory fallback), typing indicators, online/offline presence tracking, emoji picker, media sharing, and profile personalization.

---

## ⚡ Quick Start (1-Click Run)

### Option 1: Double-Click the Launcher
Simply double-click **`start-chat.bat`** in this folder. It will:
1. Boot the backend server on `http://localhost:5000`
2. Boot the Vite frontend on `http://localhost:5173`
3. Automatically open `http://localhost:5173` in your browser

---

### Option 2: Run via Terminal

#### Terminal 1 — Backend:
```bash
cd server
npm start
```

#### Terminal 2 — Frontend:
```bash
cd client
npm run dev
```

Then visit **`http://localhost:5173`** in your browser.

---

## 👥 Pre-Configured Demo Accounts for Testing

Open two browser windows or tabs (e.g., normal window and Incognito window) to test instant two-way messaging:

| User | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Sarah Connor** | `sarah@example.com` | `password123` | Demo User 1 |
| **Alex Morgan** | `alex@example.com` | `password123` | Demo User 2 |
| **Emily Chen** | `emily@example.com` | `password123` | Demo User 3 |

*(You can also register any new account directly in the app!)*

---

## 🧪 Running the Automated Test Suite

Run all verification tests across backend and frontend in one command from the project root:

```bash
npm test
```

### Verified Test Suite (17 Tests):
- ✅ Server Health Check (`/api/health`)
- ✅ Demo User Login (`/api/auth/login`)
- ✅ Invalid Credentials Rejection (401 Unauthorized)
- ✅ New User Registration with JWT (`/api/auth/register`)
- ✅ Duplicate Email Prevention (400 Bad Request)
- ✅ Profile Fetching (`/api/auth/me`)
- ✅ Unauthorized Route Protection (401 Rejection)
- ✅ User Profile Update (`/api/auth/profile`)
- ✅ Contact Directory Listing (`/api/users`)
- ✅ REST API Message Dispatch (`/api/messages`)
- ✅ Conversation History Retrieval
- ✅ Dual Socket.IO Client Handshake
- ✅ Online/Offline Presence Broadcast
- ✅ Instant Real-Time Message Transmission
- ✅ Sender Confirmation Acknowledgment (`message_sent`)
- ✅ Real-Time Typing Indicators (`user_typing` & `user_stop_typing`)
- ✅ Read Receipts Synchronization (`mark_read`)
- ✅ Frontend Production Build & Lint Compilation (0 errors)
