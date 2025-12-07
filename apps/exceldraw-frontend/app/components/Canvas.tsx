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
  X,
} from "lucide-react";
import { Game } from "../draw/Game";
import { AnimatePresence, motion } from "framer-motion";
import { HTTP_BACKEND } from "@/config";  
import toast, { Toaster } from "react-hot-toast";

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
  // BLOCK USERS WHO ARE NOT ADMIN OR COLLABORATOR
  useEffect(() => {
    async function checkAccess() {
      const token = localStorage.getItem("Authorization");
      const res = await fetch(`${HTTP_BACKEND}/rooms/${roomId}/access`, {
        headers: { Authorization: `Bearer ${token} ?? ` },
      });

      if (res.status === 403) {
        toast.error("You are not allowed to access this room");
        window.location.href = "/room";
      }
    }

    checkAccess();
  }, [roomId]);



  useEffect(() => {
    game?.setTool(selectedTool);
  }, [selectedTool, game]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const g = new Game(canvasRef.current, roomId, socket);
    setGame(g);
    return () => g.destroy();
  }, [canvasRef]);

  // Auto-resize the canvas when window size changes
  useEffect(() => {
    if (!canvasRef.current) return;

    const g = new Game(canvasRef.current, roomId, socket);
    setGame(g);

    return () => g.destroy();
  }, [canvasRef]);

  useEffect(() => {
    function handleResize() {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;

      // Resize canvas to match window
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Let the browser repaint (Game will handle next draw cycle)
      requestAnimationFrame(() => {
        // If your Game class has a draw loop, it will update automatically
      });
    }

    window.addEventListener("resize", handleResize);
    handleResize(); // run once initially

    return () => window.removeEventListener("resize", handleResize);
  }, []);



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
      <Topbar selectedTool={selectedTool} setSelectedTool={setSelectedTool} roomId={roomId} />

    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  TOP BAR                                   */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/*                                  TOP BAR                                   */
/* -------------------------------------------------------------------------- */

function Topbar({
  selectedTool,
  setSelectedTool,
  roomId,
}: {
  selectedTool: Tool;
  setSelectedTool: (s: Tool) => void;
  roomId: string;
}) {
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

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

  async function handleAdd() {
    if (!email.trim()) return toast.error("Please enter an email");

    setLoading(true);

    try {
      // Step 1: Find user
      const user = await fetch(`${HTTP_BACKEND}/find-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }).then((r) => r.json());

      if (!user?.id) {
        toast.error("❌ User not found");
        return;
      }

      const token = localStorage.getItem("Authorization");

      // Step 2: Add collaborator
      await fetch(`${HTTP_BACKEND}/rooms/${roomId}/collaborators`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token} ?? `,
        },
        body: JSON.stringify({ userId: user.id }),
      });

      toast.success("🎉 Collaborator added!");
      setShowModal(false);
      setEmail("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* ----------------------- Top Toolbar ----------------------- */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-6 left-1/3 -translate-x-1/2 z-50 flex gap-4"
      >
         <Toaster position="top-right" />

        {/* Add Collaborator Button */}
        <button
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 
          text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.03] 
          active:scale-[0.97] transition-all"
          onClick={() => setShowModal(true)}
        >
          + Add Collaborator
        </button>
        <button
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600
  text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.03]
  active:scale-[0.97] transition-all"
          onClick={() => {
            // Client-side navigation (Next.js)
            window.location.href = `/room`;
          }}
        >
          Go to Room
        </button>
        {/* Drawing Tools */}
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
                ${selectedTool === tool.id
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

      {/* ----------------------- Modal Popup ----------------------- */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-[350px] bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-white/30 dark:border-slate-700"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Add Collaborator</h2>
                <button onClick={() => setShowModal(false)}>
                  <X size={20} className="text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              <input
                type="email"
                placeholder="Enter collaborator email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="w-full p-3 rounded-xl bg-gray-100 dark:bg-slate-800 
                focus:ring-2 ring-indigo-500 outline-none mb-4"
              />

              <button
                onClick={handleAdd}
                disabled={loading}
                className="w-full py-2 rounded-xl bg-indigo-600 text-white 
                font-semibold hover:bg-indigo-700 active:scale-[0.98] transition-all"
              >
                {loading ? "Adding..." : "Add Collaborator"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
