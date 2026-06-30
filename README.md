# PLR System — Personalized Learning Recommendation System

> AI-powered learning platform built with React, Node.js, Supabase & Google Gemini

---

## 🚀 Quick Setup Guide

### Step 1 — Supabase Setup
1. Go to [https://supabase.com](https://supabase.com) and create a free project
2. Go to **SQL Editor** → New Query
3. Paste and run the full contents of `backend/migrations/001_initial.sql`
4. Go to **Project Settings → API** and copy:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` key → `SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### Step 2 — Gemini API Key
1. Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Click **Create API Key**
3. Copy the key → `GEMINI_API_KEY`

### Step 3 — Backend Setup
```bash
cd backend
copy .env.example .env   # Fill in your values
npm install
npm run dev              # Starts on http://localhost:5000
```

### Step 4 — Frontend Setup
```bash
cd frontend
npm install
npm run dev              # Starts on http://localhost:5173
```

---

## 📁 Project Structure

```
PLR-System/
├── frontend/                # React Frontend (Vite + Tailwind)
│   └── src/
│       ├── pages/           # All page components
│       ├── components/      # Layout + UI components
│       ├── services/        # API calls
│       └── store/           # Zustand state management
├── backend/                 # Node.js Backend (Express)
│   ├── migrations/          # SQL database schema
│   ├── scripts/             # Developer helper scripts (e.g. test-db.js)
│   └── src/
│       ├── routes/          # Express routes
│       ├── controllers/     # Business logic
│       ├── services/        # Gemini AI + Supabase services
│       └── utils/           # AI prompt templates
```

---

## 🤖 AI Features (Google Gemini)

| Feature | Model Used |
|---------|-----------|
| Learning Path Generation | gemini-1.5-pro |
| Personalized Recommendations | gemini-1.5-pro |
| Progress Insights | gemini-1.5-pro |
| AI Chat Assistant | gemini-2.0-flash (streaming) |
| Quiz Generation | gemini-2.0-flash |

---

## 🗂️ Environment Variables

### backend/.env
```
PORT=5000
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
SUPABASE_ANON_KEY=eyJhbGci...
GEMINI_API_KEY=AIzaSy...
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
```

### frontend/.env (create this file)
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## 📄 Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express.js (ES Modules)
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Auth**: Supabase Auth
- **AI**: Google Gemini 1.5 Pro + 2.0 Flash
- **State**: Zustand
- **Charts**: Recharts
