# CodeRunner Backend Setup & Deployment Guide

## Overview

You now have:
- **Frontend:** React app on Render (static site)
- **Backend:** Node.js/Express server (needs to be deployed separately to Render)

The backend handles push notifications that work **even when users are offline**.

## Step 1: Generate VAPID Keys

VAPID keys are required for Web Push. Run this in the `backend` folder:

```bash
cd backend
npx web-push generate-vapid-keys
```

You'll get output like:
```
Public Key: BEl62iUgtiMm9lahLbiQa7vlS9V5ilOBXQjlvS2StdM3awVTj8NvtzijWStoRgKygTHzvDOAoxMMQgiglMpg8HE=
Private Key: aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890...
```

**Note:** The public key is already set in `public/service-worker.js`. If you generated new keys, update it there.

## Step 2: Local Development

### Install Backend Dependencies
```bash
cd backend
npm install
```

### Create `.env` file
```bash
cp .env.example .env
```

Edit `backend/.env`:
```
PORT=3001
VAPID_PRIVATE_KEY=your-private-key-from-step-1
```

### Run Backend Locally
```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:3001`

### Run Frontend (in another terminal)
```bash
npm run dev
```

Frontend will proxy API calls to `http://localhost:3001`

## Step 3: Test Locally

1. Open http://localhost:5173 (or whatever port Vite shows)
2. Click on "Input" label to open ChatPanel
3. Allow notifications when prompted
4. Open another browser window with the same URL
5. In one window, type: `/notify Hey! Test notification`
6. In the other window, you should see a push notification appear 🎉

## Step 4: Deploy to Render

### Option A: Recommended - Separate Services

Create TWO services on Render:

**Service 1: Frontend (Static Site)**
- Type: Static Site
- Build Command: `npm run build`
- Publish Directory: `dist`

**Service 2: Backend (Web Service)**
- Type: Web Service
- Build Command: `cd backend && npm install`
- Start Command: `cd backend && npm start`
- Environment Variables:
  ```
  VAPID_PRIVATE_KEY=your-private-key-from-step-1
  ```

### Step 4.1: Get Backend URL

After deploying backend, you'll get a URL like:
```
https://coderunner-backend.onrender.com
```

### Step 4.2: Update Frontend Environment

In your Render frontend settings, add environment variable:
```
VITE_BACKEND_URL=https://coderunner-backend.onrender.com
```

Or add to `build.env` in frontend:
```
VITE_BACKEND_URL=https://coderunner-backend.onrender.com
```

### Step 4.3: Redeploy Frontend

Redeploy the frontend to pick up the new backend URL.

## Step 5: Verify in Production

1. Visit your frontend URL
2. Open ChatPanel
3. Allow notifications
4. Test `/notify` command from another browser/device
5. Even if you close the tab, notifications should still be delivered when you come back online

## How It Works

1. **User subscribes:** When ChatPanel opens, browser subscribes to push notifications
2. **Subscription stored:** Subscription details sent to backend `/api/subscribe`
3. **User sends /notify:** Frontend sends to `/api/notify`
4. **Backend broadcasts:** Server sends Web Push to all stored subscriptions
5. **Notification delivered:** Even offline users receive notification via OS/browser

## Troubleshooting

### Notifications not working?
- Check browser console for errors
- Ensure VAPID keys match between frontend and backend
- Verify browser notifications are enabled in settings
- Check Render service status

### Backend errors?
- Check Render logs for errors
- Verify VAPID_PRIVATE_KEY is set in environment
- Test with `curl -X GET https://your-backend.onrender.com/api/health`

### Subscribers not stored?
- Currently stored in memory (app restart clears them)
- For production, add a database (MongoDB, PostgreSQL)

## Next Steps

1. Push all changes to GitHub
2. Deploy backend to Render first
3. Get backend URL
4. Update frontend with backend URL
5. Deploy frontend to Render
6. Test end-to-end
