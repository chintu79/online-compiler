# 🚀 Deploying WebCompiler to Render

This guide provides step-by-step instructions for deploying the **WebCompiler** application to **Render** as a high-performance, cost-free static site.

---

## 📋 Pre-deployment Verification

We verified that the production build compiles perfectly:
- **Build Tool:** Vite 8 / Rolldown
- **Output Directory:** `dist`
- **Verification Command:** `npm run build` (Executed successfully with no errors)

---

## ⚡ Deployment Steps on Render

### Step 1: Push Code to GitHub / GitLab
Render connects directly to your Git repository to automatically build and deploy changes on every push.
1. Create a new repository on GitHub (e.g., `webcompiler`).
2. Push your local repository to GitHub:
   ```bash
   git remote add origin https://github.com/yourusername/webcompiler.git
   git branch -M main
   git push -u origin main
   ```

---

### Step 2: Create a New Static Site on Render
1. Log in to the [Render Dashboard](https://dashboard.render.com).
2. Click the **New +** button in the top right corner.
3. Select **Static Site** from the dropdown menu.
4. Connect your GitHub or GitLab account and choose the repository you pushed in Step 1.

---

### Step 3: Configure Build and Deploy Settings
In the configuration screen, fill in the following details:

| Setting | Value | Description |
| :--- | :--- | :--- |
| **Name** | `webcompiler` | Name of your deployment instance |
| **Region** | *Select closest region* | Server location for optimal latency |
| **Branch** | `main` | The production Git branch to build from |
| **Build Command** | `npm run build` | Compiles the React + Vite source code |
| **Publish Directory** | `dist` | The folder containing the production assets |

---

### Step 4: Configure SPA Redirect Rules (CRITICAL)
Vite builds a Single Page Application (SPA). To prevent potential `404 Not Found` errors when refreshing the page or visiting deep URLs, you must configure a redirect rule:
1. Inside your Render Static Site page, navigate to **Redirects/Rewrites** in the left sidebar.
2. Click **Add Rule**.
3. Use the following values:
   - **Source:** `/*`
   - **Destination:** `/index.html`
   - **Action:** `Rewrite`
4. Click **Save Changes**.

---

### Step 5: Trigger Deploy
- Click **Create Static Site** (or wait for the automatic build to finish).
- In a few seconds, the logs will show `Build successful` and your app will be live at a custom URL (e.g., `https://webcompiler-xxxx.onrender.com`).

---

## 🔒 Security & Backend Reliability Details

- **Remote Compiler:** Uses the public, unauthenticated **Wandbox API**. It makes outgoing HTTPS client-side requests (`https://wandbox.org/api/compile.json`), which works fully on Render Static Sites without needing a custom proxy.
- **Diagnostics Chat (Stealth UI):** Uses the public, secure **EMQX MQTT Broker** (`wss://broker.emqx.io:8084/mqtt`). WebSockets are established client-side over SSL (`wss://`), meaning there are zero CORS conflicts, certificate issues, or backend deployment blockages.
- **Local Settings:** Editor preferences (font size, theme, etc.) are stored strictly client-side using `localStorage`.

---

## 🛠️ Local Build Testing
If you ever want to build and test the production-ready bundle locally before pushing to Render:
```bash
# Build the application
npm run build

# Preview the built application locally
npm run preview
```
This serves the production files in the `dist` folder at `http://localhost:4173/` exactly as they will be served on Render.
