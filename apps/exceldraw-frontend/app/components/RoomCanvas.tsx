"use client";

import { useEffect, useRef, useState } from "react";
import { WS_URl } from "@/config";
import { Canvas } from "./Canvas";
import { motion } from "framer-motion";

export default function RoomCanvas({ roomId }: { roomId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const token = localStorage.getItem("Authorization");
    if (!token) return console.error("❌ No token found!");

    const ws = new WebSocket(`${WS_URl}?token=${token}`);

    ws.onopen = () => {
      console.log(`🎉 Connected. Joining room: ${roomId}`);
      setSocket(ws);
      ws.send(JSON.stringify({ type: "join_room", roomId }));
    };

    ws.onerror = (err) => console.error("❌ WebSocket Error:", err);

    return () => ws.close();
  }, [roomId]);

  if (!socket) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br 
      from-gray-100 via-white to-gray-200 dark:from-slate-900 dark:via-black dark:to-slate-950">

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-6 py-4 rounded-2xl backdrop-blur-xl bg-white/40 
          dark:bg-slate-900/40 border border-white/20 dark:border-slate-700 
          shadow-xl text-gray-800 dark:text-gray-100"
        >
          Connecting to room...
        </motion.div>
      </div>
    );
  }

  return (
    <Canvas roomId={roomId} socket={socket} />
  );
}
