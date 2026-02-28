# 🚀 PreparaSNS Backend - Setup Guide

The Phase 3 backend is now ready! Follow these steps to complete setup and testing.

## Prerequisites ✅

- ✅ Node.js installed
- ✅ npm packages installed (`npm install` already ran)
- ✅ Supabase project created
- ✅ VAPID keys generated
- ✅ Tables created in Supabase

## Configuration 🔧

### 1. Get Your Supabase Service Role Key

1. Open your Supabase project dashboard: https://app.supabase.com
2. Go to **Settings** → **API**
3. Copy the **Service Role Key** (NOT the anon key - it's the longer one)
4. Update `backend/.env`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=<paste-your-service-role-key-here>
   ```

### 2. Verify Environment Variables

Your `backend/.env` should have:
```bash
PORT=3001
NODE_ENV=development
SUPABASE_URL=https://jvuawfkaluedvpkfnmxy.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-actual-service-role-key>
VAPID_PUBLIC_KEY=BDaCwh50IbKMtKx3JSPilTZ8i471ElTSu0TRbi7gLeMUTnsn2RIGZJYIwAgGEq-bul3Cw_ucibmv29SusRLKcAs
VAPID_PRIVATE_KEY=KnXYRr-KBxoXPthGa9bKms1sAP7v9KoONISFjKNQ-5s
VAPID_SUBJECT=mailto:preparasns@example.com
FRONTEND_URL=http://localhost:5173
NOTIFICATION_CHECK_INTERVAL=30000
MAX_RETRIES=3
```

## Starting the Backend 🏃

### Development (with auto-reload):
```bash
cd backend
npm run dev
```

### Production:
```bash
cd backend
npm start
```

The server will start on `http://localhost:3001` with these endpoints:

**Health Check:**
```bash
GET /health
```

**Push Notifications:**
```bash
POST /api/notifications/subscribe      # Save subscription
DELETE /api/notifications/subscribe    # Remove subscription
POST /api/notifications/schedule       # Schedule notification
GET /api/notifications/scheduled       # Get pending notifications
POST /api/notifications/test           # Send test notification
POST /api/notifications/send           # Send immediate notification
```

## Verify Everything Works ✅

### 1. Health Check
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-02-28T10:55:00.000Z"
}
```

### 2. Send Test Notification
```bash
curl -X POST http://localhost:3001/api/notifications/test \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-id"}'
```

### 3. Test Full Flow

1. **Open the app**: http://localhost:5173
2. **Enable notifications** (click banner)
3. **Select an exam** and schedule tasks
4. **Watch the backend logs** for scheduled notifications being sent
5. **Check Supabase** → `push_subscriptions` table for stored subscriptions
6. **Check Supabase** → `scheduled_notifications` table for scheduled tasks

## Troubleshooting 🔧

### Error: "Invalid API key"
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Don't use the anon key, use the service role key

### Error: "Missing Supabase configuration"
- Check that `.env` file exists in `backend/` directory
- Verify all required variables are set
- Restart the server after editing `.env`

### Notifications not sending
- Check if subscription is in `push_subscriptions` table
- Verify task time is in the future
- Check backend logs for errors
- The scheduler runs every 30 seconds (configurable via `NOTIFICATION_CHECK_INTERVAL`)

### Port already in use
Change `PORT` in `.env` to a different number (e.g., 3002)

## Background Scheduler ⏰

The backend runs a notification scheduler every 30 seconds that:
1. Queries `scheduled_notifications` table for pending items
2. Finds all subscriptions for each user
3. Sends push notifications via web-push
4. Updates status to "sent" or "failed"
5. Handles invalid subscriptions (410/404 errors)

**Key Features:**
- ✅ Automatic retry for temporary failures
- ✅ Offline-queue support (notifications queue until app is open)
- ✅ Invalid subscription cleanup
- ✅ Detailed error logging

## Database Schema 📊

### push_subscriptions
```sql
id: UUID
user_id: UUID (FK → users.id)
endpoint: TEXT (Web Push API endpoint)
p256dh: TEXT (Encryption key)
auth: TEXT (Authentication token)
created_at: TIMESTAMP
last_used: TIMESTAMP
is_active: BOOLEAN
```

### scheduled_notifications
```sql
id: UUID
user_id: UUID (FK → users.id)
task_id: TEXT
scheduled_time: TIMESTAMP
notification_title: TEXT
notification_body: TEXT
notification_data: JSONB
status: TEXT (pending | sent | failed | cancelled)
sent_at: TIMESTAMP
error_message: TEXT
created_at: TIMESTAMP
```

## Next Steps 🎯

1. ✅ Get service role key and update `.env`
2. ✅ Start backend server
3. ✅ Test health endpoint
4. ✅ Open app and enable notifications
5. ✅ Create exam with tasks
6. ✅ Watch notifications arrive in real-time
7. ✅ Verify data in Supabase tables

## Git Workflow

When backend server is working correctly, commit all Phase 3 changes:
```bash
git add .
git commit -m "Phase 3: Web Push Notifications - Frontend & Backend

- Implement Web Push API with VAPID keys
- Service Worker with push event handlers
- Frontend hooks for subscription management
- Express backend with Supabase integration
- Automatic notification scheduler (every 30s)
- Push notification endpoints (subscribe, schedule, send)

Co-Authored-By: Claude <noreply@anthropic.com>"
git push
```

---

**Phase 3 Status**: 95% Complete ✅
- ✅ Frontend: Complete and building
- ✅ Service Worker: Complete
- ✅ Backend environment: Complete
- ⏳ Backend service keys: Awaiting Supabase service role key
- ⏳ Testing: Ready to test once keys configured

