# 🎨 Draw App — Real-Time Collaborative Whiteboard

A powerful, modern real-time collaboration drawing system built using **Next.js**, **WebSockets**, **Express**, **Prisma**, and **Turborepo**.  
Draw App allows multiple users to sketch, brainstorm, and design together instantly on a shared canvas — with persistent storage and live sync.

---

## 🚀 Features

### ✏️ Drawing Tools
- Rectangle, Circle, Diamond  
- Pencil  
- Arrow  
- Text  
- Image insertion  
- Eraser  
- Undo / Redo (coming soon)

### ⚡ Real-Time Collaboration
- WebSocket-powered live drawing sync  
- Multi-user rooms  
- JWT-authenticated WebSocket connection  
- Cursor-based interactions (optional extension)

### 🗄️ Reliable Persistence
- All drawing operations are saved in PostgreSQL  
- Prisma-backed ORM  
- Efficient loading of existing shapes on room join  

### 🧩 Modular Architecture
- Turborepo-based monorepo  
- Shared backend utilities  
- Clean separation of concerns  

---

## 🌐 Live Architecture Overview

```mermaid
flowchart TD
    A[Frontend - Next.js Canvas] -- WebSocket --> B[WS Backend - Realtime Updates]
    A -- REST --> C[HTTP Backend - Prisma + Express]
    B -- DB Queries --> C
    C -- Prisma --> D[(PostgreSQL Database)]
```

---

## 🏗️ Project Structure

```
.
├── apps/
│   ├── frontend/          → Next.js 15 collaborative canvas UI
│   ├── http-backend/      → Express API (Prisma CRUD)
│   ├── ws-backend/        → WebSocket real-time sync server
│
├── packages/
│   ├── db/                → Prisma schema + generated client
│   ├── ui/                → Shared UI components
│   ├── backend-common/    → Shared env + constants + JWT secret
│
├── docker-compose.yml      → Full stack container orchestration
└── turbo.json
```

---

## 🐳 Docker Setup (Production-Ready)

### 1️⃣ Start PostgreSQL first
```sh
cd packages/db
docker compose up -d
```

Run Prisma migration:
```sh
pnpm prisma db push
```

### 2️⃣ Start full stack
```sh
cd ../../
docker compose up --build
```

### Services:
| Service | URL |
|--------|-----|
| Frontend | http://localhost:8000 |
| HTTP Backend | http://localhost:4000 |
| WS Backend | ws://localhost:8088 |

---

## 💬 WebSocket Message Examples

### Join Room
```json
{
  "type": "join_room",
  "roomId": "abc-123"
}
```

### Send Shape Event
```json
{
  "type": "chat",
  "roomId": "abc-123",
  "message": "{"shape": {...}}"
}
```

---

## 📦 Tech Stack

### Frontend
- Next.js 15
- React 19
- Tailwind CSS
- Canvas API
- Framer Motion

### Backend
- Express.js
- WS WebSocket Server
- Prisma ORM
- PostgreSQL

### DevOps
- Docker
- Turborepo
- pnpm workspaces
- Vercel ready (optional)

---

## 🤝 Contributing

1. Fork the repo  
2. Create your feature branch  
3. Write clean commits  
4. Open a PR 😄  

---

## 📄 License

Licensed under the MIT License.

---

## 📎 Screenshots  

### UI Overview

<img width="1469" height="801" alt="Image" src="https://github.com/user-attachments/assets/561490dd-dbb3-423e-a535-4f4995976bcd" />
<img width="1470" height="802" alt="Image" src="https://github.com/user-attachments/assets/ec215a85-4a28-4aa8-8ff5-2e153a9f50f9" />

<img width="1421" height="711" alt="Image" src="https://github.com/user-attachments/assets/bfb793e0-7993-46e9-8cf3-5bf30775942b" />

<img width="1352" height="772" alt="Image" src="https://github.com/user-attachments/assets/200fe378-5040-4281-a766-0f1e237637f4" />
<img width="1223" height="664" alt="Image" src="https://github.com/user-attachments/assets/a17f7581-d75f-4e67-916f-36ba1bf1c6a1" />
<img width="1338" height="528" alt="Image" src="https://github.com/user-attachments/assets/355e0d21-d89f-42ee-bfe2-b655a4e7ec34" />
 
---

## ⭐ Support the Project

If you like this project, star the repo — it helps a lot 🙌  
