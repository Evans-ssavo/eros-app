# 🚨 EROS — Deployment Guide for Render

## Project Structure
```
eros/
├── backend/
│   ├── server.js          # Express server entry point
│   ├── db.js              # PostgreSQL connection + schema init
│   └── routes/
│       ├── incidents.js   # Incident CRUD + stats
│       ├── sos.js         # SOS alert endpoints
│       └── reports.js     # Anonymous reports
├── frontend/
│   └── public/
│       └── index.html     # Full frontend (served by Express)
├── package.json
├── .env.example
└── .gitignore
```

---

## Step 1 — Push to GitHub

1. Create a new repo on github.com (e.g. `eros-app`)
2. Run these commands in your project folder:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/eros-app.git
git push -u origin main
```

---

## Step 2 — Create PostgreSQL Database on Render

1. Go to [render.com](https://render.com) and sign in
2. Click **New +** → **PostgreSQL**
3. Fill in:
   - **Name:** `eros-db`
   - **Region:** choose closest to you
   - **Plan:** Free
4. Click **Create Database**
5. Wait ~1 minute, then copy the **Internal Database URL**

---

## Step 3 — Deploy the Web Service on Render

1. Click **New +** → **Web Service**
2. Connect your GitHub repo (`eros-app`)
3. Fill in:
   - **Name:** `eros-app`
   - **Region:** same as your database
   - **Branch:** `main`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free
4. Under **Environment Variables**, add:
   - `DATABASE_URL` → paste the Internal Database URL from Step 2
   - `NODE_ENV` → `production`
5. Click **Create Web Service**

---

## Step 4 — Done! 🎉

Render will build and deploy your app. In ~2 minutes you'll get a live URL like:
```
https://eros-app.onrender.com
```

The database tables are **created automatically** on first startup.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/incidents` | Get all incidents |
| POST | `/api/incidents` | Create incident |
| PATCH | `/api/incidents/:id/resolve` | Resolve incident |
| DELETE | `/api/incidents/:id` | Delete incident |
| GET | `/api/incidents/stats/summary` | Dashboard stats |
| POST | `/api/sos` | Trigger SOS alert |
| GET | `/api/sos` | Get SOS history |
| POST | `/api/reports` | Submit anonymous report |
| GET | `/api/reports` | Get all reports (admin) |
| PATCH | `/api/reports/:id/status` | Update report status |

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env
# Edit .env and add your local PostgreSQL URL

# 3. Run in dev mode
npm run dev
```
