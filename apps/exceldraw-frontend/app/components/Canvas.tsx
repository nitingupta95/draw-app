"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Circle,
  Diamond,
  Image,
  Pencil,
  RectangleHorizontalIcon,
  Eraser,
  Type,
} from "lucide-react";
import { Game } from "../draw/Game";
import { motion } from "framer-motion";

export type Tool =
  | "circle"
  | "rect"
  | "pencil"
  | "diamond"
  | "arrow"
  | "text"
  | "image"
  | "eraser";

export function Canvas({ roomId, socket }: { socket: WebSocket; roomId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<Game>();
  const [selectedTool, setSelectedTool] = useState<Tool>("pencil");

  useEffect(() => {
    game?.setTool(selectedTool);
  }, [selectedTool, game]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const g = new Game(canvasRef.current, roomId, socket);
    setGame(g);
    return () => g.destroy();
  }, [canvasRef]);

  return (
    <div className="h-screen w-screen relative overflow-hidden 
    bg-gradient-to-br from-gray-100 via-white to-gray-200 
    dark:from-black dark:via-slate-900 dark:to-slate-950">

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        className="absolute inset-0"
      />

      {/* Toolbar */}
      <Topbar selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  TOP BAR                                   */
/* -------------------------------------------------------------------------- */

function Topbar({
  selectedTool,
  setSelectedTool,
}: {
  selectedTool: Tool;
  setSelectedTool: (s: Tool) => void;
}) {
  const tools = [
    { id: "pencil", icon: <Pencil size={18} /> },
    { id: "rect", icon: <RectangleHorizontalIcon size={18} /> },
    { id: "circle", icon: <Circle size={18} /> },
    { id: "diamond", icon: <Diamond size={18} /> },
    { id: "arrow", icon: <ArrowRight size={18} /> },
    { id: "text", icon: <Type size={18} /> },
    { id: "image", icon: <Image size={18} /> },
    { id: "eraser", icon: <Eraser size={18} /> },
  ] as const;

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div
        className="flex gap-2 px-4 py-2 rounded-2xl shadow-xl backdrop-blur-xl 
      bg-white/60 dark:bg-slate-900/60 border border-white/30 dark:border-slate-700"
      >
        {tools.map((tool) => (
          <motion.button
            whileTap={{ scale: 0.92 }}
            key={tool.id}
            onClick={() => setSelectedTool(tool.id as Tool)}
            className={`p-2 rounded-xl transition-all flex items-center justify-center
              ${
                selectedTool === tool.id
                  ? "bg-indigo-600 text-white shadow"
                  : "text-gray-800 dark:text-gray-300 hover:bg-white/40 dark:hover:bg-slate-800"
              }
            `}
          >
            {tool.icon}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
