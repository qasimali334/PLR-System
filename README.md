# PLR System — Personalized Learning Recommendation System

> AI-powered learning platform built with React, Node.js, Supabase & Google Gemini


## 🚀 Quick Setup Guide


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


## 📄 Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express.js (ES Modules)
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Auth**: Supabase Auth
- **AI**: Google Gemini 1.5 Pro + 2.0 Flash
- **State**: Zustand
- **Charts**: Recharts
