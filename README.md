# 💬 PulseChat — Full-Stack Real-Time Chat Application

A high-performance, modern real-time chat application built with **React (Vite)**, **Django REST Framework (DRF)**, **Django Channels (WebSockets)**, and **JWT Authentication**.

---

## ✨ Features

- **Authentication & Profiles**
  - Secure JWT authentication (`access` & `refresh` tokens)
  - User registration & instant login
  - User profile customization (bio, name, custom avatar with DiceBear generator)
  - Live online/offline status presence indicator

- **Real-Time 1-on-1 Chat**
  - Instant bi-directional messaging powered by Django Channels & WebSockets
  - Real-time typing indicators (*"typing..."*)
  - Real-time read receipts (single check / double check ticks)
  - Soft-delete own messages with live synchronization across participants
  - Grouped messages with dynamic date separators (*Today*, *Yesterday*, *Date*)
  - Interactive emoji picker popover

- **Conversations & User Search**
  - Dynamic sidebar with recent conversation threads
  - Unread message count badges updated in real time
  - Instant user search modal to start conversations with registered users
  - Responsive mobile drawer support for seamless smartphone experience

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18 (Vite), Vanilla CSS3 Design System, Lucide React Icons, Axios, Date-fns, Canvas Confetti |
| **Backend** | Python 3.14, Django 5, Django REST Framework, SimpleJWT |
| **Real-time** | Django Channels 4, Daphne (ASGI Server), WebSockets |
| **Database** | SQLite (Default) / MySQL & PostgreSQL (via `.env` config) |

---

## 📁 Project Architecture

```
real-time-chat-app/
├── backend/
│   ├── chat_backend/          # Project settings, ASGI & WSGI routing
│   │   ├── asgi.py            # ProtocolTypeRouter for WebSockets + HTTP
│   │   ├── settings.py        # Django settings, Channels, SimpleJWT, CORS
│   │   └── urls.py            # Root URL config
│   ├── users/                 # Custom User model, Auth & Search APIs
│   │   ├── models.py          # Custom User model (avatar, bio, presence)
│   │   ├── serializers.py     # Auth & Profile serializers
│   │   └── views.py           # Register, Login, Search endpoints
│   ├── chat/                  # Conversation, Message models & WebSockets
│   │   ├── models.py          # Conversation, Message models
│   │   ├── serializers.py     # Conversation & Message serializers
│   │   ├── consumers.py       # Async WebSocket Consumer (messages, typing, read receipts)
│   │   ├── middleware.py      # JWT WebSocket Auth Middleware
│   │   └── routing.py         # WebSocket URL patterns (`ws/chat/<id>/`)
│   ├── seed_data.py           # Database seeder with demo accounts & chats
│   ├── test_realtime.py       # Automated WebSocket & REST integration test suite
│   ├── requirements.txt
│   └── manage.py
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Sidebar/       # Sidebar, ConversationItem, UserSearchModal
    │   │   ├── ChatWindow/    # ChatHeader, MessageList, MessageInput, EmptyChat
    │   │   └── Common/        # Avatar with status dot, ProfileModal
    │   ├── context/
    │   │   ├── AuthContext.jsx       # Authentication state & token refresh
    │   │   └── SocketContext.jsx     # WebSocket connection & real-time event dispatchers
    │   ├── services/
    │   │   ├── api.js                # Axios instance with JWT interceptors
    │   │   ├── authService.js
    │   │   └── chatService.js
    │   ├── pages/
    │   │   ├── Login.jsx             # Auth screen with 1-click demo accounts
    │   │   ├── Register.jsx          # Register screen with avatar generator
    │   │   └── ChatPage.jsx          # Responsive split-pane layout
    │   ├── App.jsx
    │   └── index.css                 # Cyber-glass dark theme & design tokens
    └── package.json
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv ../venv
..\venv\Scripts\activate  # On Windows
# source ../venv/bin/activate  # On Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations users chat
python manage.py migrate

# Seed sample users and messages
python seed_data.py

# Start Daphne ASGI server (handles both HTTP and WebSockets)
daphne -b 127.0.0.1 -p 8000 chat_backend.asgi:application
```

### 3. Frontend Setup
```bash
# In a new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser!

---

## 👥 Demo Test Accounts

All accounts use the password: `password123`

| Username | Name | Role / Bio |
|---|---|---|
| `alex` | Alex Rivera | Full-stack enthusiast & coffee lover |
| `sarah` | Sarah Chen | UI/UX Designer & Frontend wizard |
| `michael` | Michael Scott | Regional Manager at Dunder Mifflin |
| `emily` | Emily Watson | Data Scientist \| AI & Python |

> **Pro Tip**: Open `http://localhost:5173` in a regular browser window (e.g. login as **Alex**) and in an Incognito/Private window (login as **Sarah**) to test live real-time messaging, typing indicators, and instant read receipts between the two accounts!

---

## 🧪 Automated Testing

Run the automated real-time test suite to verify JWT authentication, user discovery, and live WebSocket message delivery:

```bash
cd backend
python test_realtime.py
```

---

## 🗄 Switching Database (MySQL / PostgreSQL)

By default, SQLite is used for zero-configuration local setup. To use **MySQL** or **PostgreSQL**, update your `backend/.env` file:

```env
# For MySQL:
DB_ENGINE=django.db.backends.mysql
DB_NAME=chat_app_db
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306

# For PostgreSQL:
# DB_ENGINE=django.db.backends.postgresql
# DB_NAME=chat_app_db
# DB_USER=postgres
# DB_PASSWORD=your_password
# DB_HOST=localhost
# DB_PORT=5432
```
