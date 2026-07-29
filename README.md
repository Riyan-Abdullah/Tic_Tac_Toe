````markdown
<div align="center">

# 🎮 TicTac Arena

### Play. Compete. Climb the Leaderboard.

A modern **real-time multiplayer Tic Tac Toe platform** built with **Next.js, FastAPI, Supabase, and WebSockets**. Featuring AI gameplay, online multiplayer, authentication, leaderboards, achievements, and a premium Black & Gold gaming experience.

<p>

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

</p>

</div>

---

## 📖 Overview

**TicTac Arena** is a modern full-stack multiplayer gaming platform where players can enjoy intelligent AI matches or compete online in real time. The project is designed with scalability, performance, and clean architecture in mind while delivering a premium gaming experience.

---

# ✨ Features

## 🔐 Authentication

- User Registration & Login
- Secure Authentication with Supabase
- Protected Routes
- Persistent Sessions

## 🤖 AI Gameplay

- Easy Difficulty
- Medium Difficulty
- Hard Difficulty (Minimax Algorithm)
- Instant Restart

## 🌐 Online Multiplayer

- Create Private Rooms
- Join with Room Code
- Real-Time Gameplay
- WebSocket Synchronization
- Turn Validation
- Winner Detection
- Draw Detection
- Automatic Reconnection

## 🏆 Competitive Features

- Leaderboard
- Player Rankings
- Match History
- Performance Statistics
- Achievement System

## 🎨 User Interface

- Premium Black & Gold Theme
- Glassmorphism Design
- Responsive Layout
- Framer Motion Animations
- Mobile Friendly

---

# 🛠 Tech Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Zustand
- Framer Motion
- Axios

### Backend

- FastAPI
- Python
- WebSockets

### Database

- Supabase PostgreSQL

### Authentication

- Supabase Auth

### Deployment

- Vercel
- Render
- Supabase

---

# 📂 Project Structure

```text
TicTacArena
│
├── frontend
│   ├── app
│   ├── components
│   ├── hooks
│   ├── lib
│   ├── services
│   ├── store
│   ├── types
│   └── utils
│
├── backend
│   ├── app
│   ├── routers
│   ├── services
│   ├── models
│   ├── schemas
│   └── main.py
│
└── README.md
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/Riyan-Abdullah/Tic_Tac_Toe.git
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

---

# 🔑 Environment Variables

### Frontend

```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

### Backend

```env
SUPABASE_URL=YOUR_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
SECRET_KEY=YOUR_SECRET_KEY
```

---

# 🌐 Main Features

- ✅ Authentication
- ✅ AI Opponent
- ✅ Online Multiplayer
- ✅ FastAPI WebSockets
- ✅ Room Management
- ✅ Match History
- ✅ Leaderboard
- ✅ Player Statistics
- ✅ Achievements
- ✅ Responsive Design
- ✅ Premium UI

---

# 🔒 Security

- JWT Authentication
- Protected Routes
- Environment Variables
- Row Level Security (RLS)
- API Validation
- Secure WebSocket Communication

---

# ⚡ Performance

- Optimized React Components
- Lazy Loading
- Efficient State Management
- Fast WebSocket Communication
- Responsive UI
- Production-Ready Architecture

---

# 📅 Future Improvements

- Voice Chat
- Spectator Mode
- Daily Challenges
- Custom Themes
- Match Replay
- Push Notifications
- Mobile Application

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

---

# 📄 License

This project is licensed under the **MIT License**.

---

# 👨‍💻 Author

**Riyan Abdullah**

**Data Science Student | Full Stack Developer | AI Enthusiast**

GitHub: **https://github.com/Riyan-Abdullah**

---

<div align="center">

### ⭐ If you like this project, don't forget to star the repository!

Made with ❤️ using **Next.js**, **FastAPI**, **Supabase**, and **WebSockets**.

</div>
````
