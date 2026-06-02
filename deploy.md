# 🚀 Deploying CodeRunner to Render

This guide provides step-by-step instructions for deploying the **CodeRunner** application to **Render** with backend support for offline push notifications.

---

## 📋 Architecture

- **Frontend:** React + Vite (Static Site on Render)
- **Backend:** Node.js/Express (Web Service on Render)
- **Push Notifications:** Web Push API + Service Workers (works offline)

---

## 🔑 Step 1: Generate VAPID Keys (Do This First)

Push notifications require VAPID keys. Generate them locally:

```bash
cd backend
npx web-push generate-vapid-keys
```

**Output example:**
```
Public Key: BEl62iUgtiMm9lahLbiQa7vlS9V5ilOBXQjlvS2StdM3awVTj8NvtzijWStoRgKygTHzvDOAoxMMQgiglMpg8HE=
Private Key: 3LvwgobkwHsBAjvDUcEODRG-S-_vNCRj_Mcdno6ht-o
```

⚠️ **Save these safely** — you'll need the private key in Step 5.

---

## 📚 Step 2: Push Code to GitHub

```bash
git remote add origin https://github.com/yourusername/java-code-editor.git
git branch -M main
git push -u origin main
```

---

## 🖥️ Step 3: Deploy Backend Service (Create First)

The backend must be deployed first so you can get its URL.

### 3.1 Create Web Service on Render

1. Go to [render.com](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Fill in the configuration:

| Setting | Value |
|---------|-------|
| **Name** | `coderunner-backend` |
| **Region** | *Select closest region* |
| **Branch** | `main` |
| **Runtime** | Node |
| **Build Command** | `cd backend && npm install` |
| **Start Command** | `cd backend && npm start` |

### 3.2 Add Environment Variables

In the Render dashboard for your backend service:

1. Navigate to **Environment** section
2. Click **Add Environment Variable**
3. Add:
   - **Key:** `VAPID_PRIVATE_KEY`
   - **Value:** *(paste your private key from Step 1)*

### 3.3 Deploy Backend

Click **Create Web Service**. Wait for deployment to complete.

**Save the backend URL** — you'll see something like:
```
https://coderunner-backend.onrender.com
```

---

## 🎨 Step 4: Deploy Frontend Static Site

### 4.1 Create Static Site on Render

1. Click **New +** → **Static Site**
2. Connect your GitHub repository
3. Fill in the configuration:

| Setting | Value |
|---------|-------|
| **Name** | `coderunner-frontend` |
| **Region** | *Select closest region* |
| **Branch** | `main` |
| **Build Command** | `npm run build` |
| **Publish Directory** | `dist` |

### 4.2 Add Environment Variables

In the Render dashboard for your frontend static site:

1. Navigate to **Environment** section
2. Click **Add Environment Variable**
3. Add:
   - **Key:** `VITE_BACKEND_URL`
   - **Value:** *(paste your backend URL from Step 3.3, e.g., `https://coderunner-backend.onrender.com`)*

### 4.3 Configure SPA Redirect (CRITICAL)

1. Go to **Redirects/Rewrites** in the left sidebar
2. Click **Add Rule**
3. Configure:
   - **Source:** `/*`
   - **Destination:** `/index.html`
   - **Action:** `Rewrite`
4. Click **Save Changes**

### 4.4 Deploy Frontend

Click **Create Static Site**. Wait for deployment to complete.

Your app will be live at:
```
https://coderunner-frontend-xxxx.onrender.com
```

---

## ✅ Step 5: Verify Deployment

1. Visit your frontend URL
2. Open ChatPanel (click on "Input" label)
3. Allow notifications when prompted
4. Test `/notify Hello from production!`
5. Open in another browser/device to verify offline notifications work

---

## 🔒 Security & Infrastructure

| Component | Service | Notes |
|-----------|---------|-------|
| **Frontend** | Render Static Site | SPA with client-side routing |
| **Backend** | Render Web Service | Node.js + web-push for notifications |
| **Code Compilation** | Wandbox API | Public, client-side API calls |
| **Chat** | EMQX MQTT Broker | Secure WebSockets (`wss://`) |
| **Settings** | Browser localStorage | Client-side only |
| **Notifications** | Web Push API | Service Workers handle offline delivery |

---

## 🛠️ Local Testing

### Build Frontend Locally

```bash
npm run build
npm run preview
```

Serves at `http://localhost:4173/`

### Run Backend Locally

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your VAPID_PRIVATE_KEY
npm run dev
```

Backend runs on `http://localhost:3001`

### Test Frontend with Local Backend

Edit `.env` in root:
```
VITE_BACKEND_URL=http://localhost:3001
```

Then run:
```bash
npm run dev
```

---

## 📝 Troubleshooting

### Notifications not working?
- Verify `VAPID_PRIVATE_KEY` is set in backend environment
- Check browser console for errors
- Ensure notifications are enabled in browser settings

### Backend not responding?
- Check Render backend service logs
- Verify environment variable is set correctly
- Test with: `curl https://your-backend.onrender.com/api/health`

### Frontend not finding backend?
- Verify `VITE_BACKEND_URL` is set in frontend environment
- Redeploy frontend after setting the variable
- Check browser Network tab to see proxy requests

---

## 🚀 Future Improvements

For production, consider:
- Add database (MongoDB, PostgreSQL) for persistent subscriptions
- Implement user authentication
- Add analytics and monitoring
- Set up automated backups

