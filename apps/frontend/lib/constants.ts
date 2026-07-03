import {
  PenTool,
  RefreshCcw,
  Database,
  Layers,
  History,
} from "lucide-react";
import { Feature, TechStackItem, WebSocketMessageExample } from "./types";

export const FEATURES: Feature[] = [
  {
    title: "Drawing Tools",
    description:
      "Rectangle, Circle, Diamond, Pencil, Arrow, Text, Image, and Eraser tools available instantly.",
    icon: PenTool,
  },
  {
    title: "Real-Time Sync",
    description:
      "WebSocket-powered, multi-user rooms, with JWT-authenticated connections for secure collaboration.",
    icon: RefreshCcw,
  },
  {
    title: "Persistent Storage",
    description:
      "PostgreSQL + Prisma for efficient shape loading on room join and permanent storage.",
    icon: Database,
  },
  {
    title: "Modular Architecture",
    description:
      "Turborepo monorepo with shared packages for DB, UI, and backend utilities.",
    icon: Layers,
  },
  {
    title: "Undo / Redo",
    description: "Time-travel through your canvas history. Coming soon.",
    icon: History,
    isComingSoon: true,
  },
];

export const TECH_STACK: TechStackItem[] = [
  { name: "Next.js 15", category: "Frontend" },
  { name: "React 19", category: "Frontend" },
  { name: "Tailwind CSS", category: "Frontend" },
  { name: "Canvas API", category: "Frontend" },
  { name: "Framer Motion", category: "Frontend" },
  { name: "Express.js", category: "Backend" },
  { name: "WS WebSocket Server", category: "Backend" },
  { name: "Prisma ORM", category: "Backend" },
  { name: "PostgreSQL", category: "Backend" },
  { name: "Docker", category: "DevOps" },
  { name: "Turborepo", category: "DevOps" },
  { name: "pnpm workspaces", category: "DevOps" },
];

export const WS_EXAMPLES: WebSocketMessageExample[] = [
  {
    type: "join_room",
    description: "Join a room to start receiving live updates.",
    payload: {
      type: "join_room",
      roomId: "123",
    },
  },
  {
    type: "chat",
    description: "Send a shape or message event to the room.",
    payload: {
      type: "chat",
      roomId: "123",
      message: "Hey everyone! 👋",
    },
  },
];
