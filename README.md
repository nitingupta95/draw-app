# 🎨 Sketch Collab — Real-Time Collaborative Whiteboard

A powerful, modern real-time collaboration drawing system built using **Next.js**, **WebSockets**, **Prisma**, and **Turborepo**.  
Sketch Collab allows multiple users to sketch, brainstorm, and design together instantly on a shared canvas — with persistent storage and live synchronization.

---

## 🚀 Core Features

### ✏️ Extensive Drawing Tools
- **Shapes:** Rectangle, Circle, Diamond, Line  
- **Freehand:** Pencil  
- **Pointers:** Arrow  
- **Media:** Text and Image insertion  
- **Modifiers:** Eraser, Selection, and Marquee Tool
- **History:** Full Undo / Redo functionality

### ⚡ Real-Time Collaboration
- **Low Latency:** WebSocket-powered live drawing synchronization  
- **Rooms & Access Control:** Multi-user rooms with Admin and Collaborator roles
- **Security:** JWT-authenticated WebSocket connections  
- **Extensibility:** Cursor-based interactions (optional extension)

### 🗄️ Reliable Persistence
- **Database:** All drawing operations and chat messages are saved in PostgreSQL  
- **ORM:** Prisma-backed schema  
- **State Hydration:** Efficient loading of existing shapes upon joining a room  

---

## 📦 Tech Stack

### Frontend & API (Monolithic UI layer)
- **Next.js 15:** App Router utilized for both UI rendering and HTTP API Routes
- **React 19:** Utilizing the latest React concurrent features
- **Styling & UI:** Tailwind CSS, Framer Motion, Lucide Icons
- **Canvas Rendering:** Native HTML5 Canvas
### Real-Time Backend
- **Server:** Node.js running a lightweight `ws` WebSocket Server
- **Data Access:** Prisma ORM
- **Database:** PostgreSQL

### Infrastructure & DevOps
- **Monorepo Management:** Turborepo & npm workspaces
- **Containerization:** Docker & Docker Compose
- **Deployment:** Vercel-ready for the frontend

---

## 🌐 Application Architecture

The system is designed with a clear separation between the HTTP REST layer (for authentication, room management, etc.) and the WebSocket layer (for high-frequency drawing events).

```mermaid
flowchart TD
    Client[Browser Canvas Client]
    
    subgraph Frontend Application
        NextUI[Next.js React UI]
        NextAPI[Next.js API Routes]
    end
    
    subgraph Real-Time Service
        WSServer[Node.js WebSocket Server]
    end
    
    DB[(PostgreSQL Database)]

    Client <-->|REST / JSON| NextUI
    Client <-->|REST / JSON| NextAPI
    Client <-->|ws:// Real-time Sync| WSServer
    
    NextAPI <-->|Prisma ORM| DB
    WSServer <-->|Prisma ORM| DB
```

---

## 🏗️ Project Structure

This repository is structured as a Turborepo monorepo, separating the applications and shared packages into modular units.

```text
.
├── apps/
│   ├── frontend/          → Next.js 15 collaborative canvas UI + API Routes (Port 8000)
│   ├── ws-backend/        → Node.js WebSocket real-time sync server (Port 8088)
│
├── packages/
│   ├── db/                → Prisma schema, migrations, and generated client
│   ├── ui/                → Shared UI components
│   ├── backend-common/    → Shared server-side constants & config (e.g., JWT secret)
│   ├── common/            → Shared types and validation schemas
│
├── docker-compose.yml     → Full stack container orchestration
└── turbo.json             → Turborepo pipeline configuration
```

---

## 🗃️ Database Schema Overview

The database uses PostgreSQL via Prisma. Key models include:

- **User**: Represents authenticated users.
- **Room**: Represents drawing rooms. A room has one `admin`.
- **Collaborator**: An intersection table mapping users to rooms with permissions (`canEdit`).
- **Chat**: This table acts as an event log. It stores actual text chats *as well as* serialized JSON representing canvas shapes drawn by users. This provides an immutable history of the canvas state.

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory. You will need the following variables:

```env
# The connection string for your PostgreSQL database
DATABASE_URL="postgresql://user:password@localhost:5432/SketchCollab?schema=public"

# The secret key for signing JWT tokens
JWT_SECRET="your-super-secret-jwt-key"
```

---

## 💻 Local Development Setup

### Prerequisites
- Node.js >= 18
- npm (v11+ recommended)
- PostgreSQL running locally or remotely

### 1. Install Dependencies
Install dependencies across all workspaces from the project root:
```bash
npm install
```

### 2. Database Setup & Migration
Push the Prisma schema to your PostgreSQL database and generate the Prisma Client:
```bash
cd packages/db
npx prisma db push
npx prisma generate
cd ../../
```

### 3. Run the Development Servers
Start all applications concurrently using Turborepo:
```bash
npm run dev
```
- The **Frontend** will be available at: `http://localhost:8000`
- The **WebSocket Server** will run at: `ws://localhost:8088`

---

## 🐳 Docker Setup (Production-Ready)

If you prefer using Docker to run the entire stack locally without installing Node or Postgres:

### 1. Start PostgreSQL
Spin up the database container:
```bash
cd packages/db
docker compose up -d
```

Push the database schema:
```bash
npx prisma db push
```

### 2. Start Full Stack
From the root directory, build and start all services:
```bash
docker compose up --build
```

---

## 💬 WebSocket Communication Protocol

The WebSocket server expects a `token` in the connection query string for JWT authentication:
`ws://localhost:8088?token=YOUR_JWT_TOKEN`

### Events

#### Join Room
Sent by the client when they navigate to a specific canvas room. Validates user permissions.
```json
{
  "type": "join_room",
  "roomId": "room-uuid"
}
```

#### Send Shape Event (Chat type)
Drawing strokes and actions are serialized and sent over the `chat` event type.
```json
{
  "type": "chat",
  "roomId": "room-uuid",
  "message": "{\"shape\": {\"id\": \"123\", \"type\": \"rect\", \"x\": 10, \"y\": 10, ...}}"
}
```

#### Leave Room
```json
{
  "type": "leave_room",
  "roomId": "room-uuid"
}
```

---

## 📜 Scripts Reference

Useful npm scripts defined in the root `package.json`:

- `npm run dev`: Starts the development servers across all apps using Turborepo.
- `npm run build`: Builds all applications for production.
- `npm run start`: Runs the built production servers concurrently.
- `npm run dev:frontend`: Starts *only* the Next.js frontend application.
- `npm run dev:ws`: Starts *only* the WebSocket server.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 📎 Screenshots  

### UI Overview
 <img width="868" height="708" alt="Screenshot 2026-07-04 at 2 53 41 PM" src="https://github.com/user-attachments/assets/8a120b5b-d19a-4e44-9c16-278009d8e183" />
 <img width="884" height="663" alt="Screenshot 2026-07-04 at 2 53 50 PM" src="https://github.com/user-attachments/assets/45757ea4-dcd0-4e86-9925-c6cec76aa8fe" />
 <img width="1413" height="773" alt="Screenshot 2026-07-04 at 2 59 22 PM" src="https://github.com/user-attachments/assets/075ea25b-835e-4c1a-942b-3f852373420f" />
 <img width="1172" height="821" alt="Screenshot 2026-07-04 at 2 59 38 PM" src="https://github.com/user-attachments/assets/7bbe5057-141b-4224-b96b-33b6436c793e" />
<img width="1444" height="713" alt="Screenshot 2026-07-04 at 2 59 54 PM" src="https://github.com/user-attachments/assets/1c6b5d28-dff3-4f99-8924-280ed85cc626" />

---




## ⭐ Support the Project

If you like this project, please consider starring the repository — it helps a lot 🙌
