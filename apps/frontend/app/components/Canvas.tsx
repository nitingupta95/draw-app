"use client";

import { useEffect, useRef, useState } from "react";
import { Game, Tool } from "../draw/Game";
import { HTTP_BACKEND } from "@/config";  
import toast from "react-hot-toast";
import { Topbar } from "./canvas/Topbar";
import { FloatingToolbar } from "./canvas/FloatingToolbar";

export function Canvas({ roomId, socket }: { socket: WebSocket; roomId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<Game>();
  const [selectedTool, setSelectedTool] = useState<Tool>("pencil");
  const [canEdit, setCanEdit] = useState<boolean>(true);

  // BLOCK USERS WHO ARE NOT ADMIN OR COLLABORATOR
  useEffect(() => {
    async function checkAccess() {
      let token = localStorage.getItem("Authorization");
      if (token && !token.startsWith("Bearer ")) token = `Bearer ${token}`;
      const res = await fetch(`${HTTP_BACKEND}/rooms/${roomId}/access`, {
        headers: { Authorization: token || "" },
      });

      if (res.status === 403) {
        const passcode = window.prompt("This room requires a passcode to join. Please enter it below (leave blank if none):");
        if (passcode !== null) {
          try {
            const joinRes = await fetch(`${HTTP_BACKEND}/rooms/${roomId}/join`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: token || "",
              },
              body: JSON.stringify({ passcode })
            });
            if (joinRes.ok) {
              window.location.reload();
              return;
            } else {
              toast.error("Invalid passcode");
            }
          } catch(err) {}
        }
        toast.error("You are not allowed to access this room");
        window.location.href = "/room";
      } else if (res.ok) {
        const data = await res.json();
        if (data.role === "collaborator") {
          setCanEdit(data.canEdit);
        } else if (data.role === "admin") {
          setCanEdit(true);
        } else {
          setCanEdit(false);
        }
      }
    }
    checkAccess();
  }, [roomId]);

  useEffect(() => {
    game?.setCanEdit(canEdit);
    game?.setTool(selectedTool);
  }, [selectedTool, game, canEdit]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const g = new Game(canvasRef.current, roomId, socket);
    setGame(g);
    return () => g.destroy();
  }, [canvasRef, roomId, socket]);

  useEffect(() => {
    function handleResize() {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (game) {
        requestAnimationFrame(() => {
          game.clearCanvas();
        });
      }
    }
    window.addEventListener("resize", handleResize);
    handleResize(); 
    return () => window.removeEventListener("resize", handleResize);
  }, [game]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't intercept if user is typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          game?.redo();
        } else {
          game?.undo();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [game]);

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-[#FDFDFE] font-sans">

      {/* Decorative Glows for the Canvas Background */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-purple-400/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-[500px] h-[500px] bg-indigo-400/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={typeof window !== "undefined" ? window.innerWidth : 800}
        height={typeof window !== "undefined" ? window.innerHeight : 600}
        className="absolute inset-0 cursor-crosshair"
      />

      {/* Top Navbar */}
      <Topbar roomId={roomId} />

      {/* Floating Drawing Toolbar */}
      <FloatingToolbar selectedTool={selectedTool} setSelectedTool={setSelectedTool} canEdit={canEdit} game={game} />
    </div>
  );
}
