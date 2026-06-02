# CodeRunner Backend

Node.js/Express backend for handling push notifications using web-push.

## Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Generate VAPID Keys

Run this command once to generate your VAPID keys:

```bash
npx web-push generate-vapid-keys
```

This will output:
```
Public Key: BEl62iUgtiMm9lahLbiQa7vlS9V5ilOBXQjlvS2StdM3awVTj8NvtzijWStoRgKygTHzvDOAoxMMQgiglMpg8HE=
Private Key: your-private-key-here
```

### 3. Update Frontend VAPID Key

If you generated new VAPID keys, update the public key in `public/service-worker.js` in the frontend.

### 4. Configure Environment Variables

Copy `.env.example` to `.env` and add your VAPID private key:

```bash
cp .env.example .env
```

Edit `.env`:
```
PORT=3001
VAPID_PRIVATE_KEY=your-vapid-private-key-here
```

### 5. Run Locally

```bash
npm run dev
```

Server will run on `http://localhost:3001`

## Deploy to Render

### 1. Push to GitHub

Make sure your entire repo (frontend + backend) is pushed to GitHub.

### 2. Create New Web Service on Render

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Fill in details:
   - **Name:** `coderunner-backend`
   - **Environment:** Node
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Plan:** Free (or paid)

### 3. Set Environment Variables

In the Render dashboard:
1. Go to your service → Environment
2. Add variables:
   - `VAPID_PRIVATE_KEY` = your-private-key-from-step-2

### 4. Deploy

Click Deploy. Render will give you a URL like:
```
https://coderunner-backend.onrender.com
```

### 5. Update Frontend to Use Backend

Update `vite.config.js` proxy:

```javascript
server: {
  proxy: {
    '/api': {
      target: 'https://coderunner-backend.onrender.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
}
```

## API Endpoints

### POST `/api/subscribe`
Store a push subscription.

**Request:**
```json
{
  "endpoint": "https://...",
  "keys": { "p256dh": "...", "auth": "..." }
}
```

### POST `/api/notify`
Send notification to all subscribers.

**Request:**
```json
{
  "user": "username",
  "message": "Your notification message"
}
```

**Response:**
```json
{
  "message": "Notification sent to 5 users",
  "sentTo": 5
}
```

### GET `/api/health`
Check service status and subscriber count.

## Notes

- Subscriptions are stored in memory. For production, use a database like MongoDB or PostgreSQL.
- Invalid subscriptions (HTTP 410) are automatically removed.
- The same VAPID public key must be used in both backend and frontend service worker.
