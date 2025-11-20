"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { LogOut, Plus, DoorOpen } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { HTTP_BACKEND } from "@/config";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface Room {
  id: number;
  slug: string;
}

interface User {
  id: string;
  email: string;
  name?: string;
}

export default function RoomPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("Authorization");
    const token = storedToken?.startsWith("Bearer ")
      ? storedToken
      : `Bearer ${storedToken}`;

    if (!token) {
      toast.error("Session expired. Please login again.");
      router.push("/signin");
      return;
    }
    fetchUserData(token);
  }, []);

  const fetchUserData = async (token: string) => {
    try {
      const response = await axios.get(`${HTTP_BACKEND}/me`, {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });

      if (!response.data?.user) throw new Error("Invalid user data");

      setUser(response.data.user);
      setRooms(response.data.rooms || []);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("Authorization");
    router.push("/signin");
  };

  const createRoom = async () => {
    if (!newRoomName.trim()) return toast.error("Enter a valid room name");

    setIsCreatingRoom(true);
    try {
      const storedToken = localStorage.getItem("Authorization");
      const token = storedToken?.startsWith("Bearer ")
        ? storedToken
        : `Bearer ${storedToken}`;

      const response = await axios.post(
        `${HTTP_BACKEND}/room`,
        { name: newRoomName },
        { headers: { Authorization: token } }
      );

      setRooms((prev) => [...prev, response.data.room]);
      setNewRoomName("");
      toast.success("Room created!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error creating room");
    } finally {
      setIsCreatingRoom(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden 
    bg-gradient-to-br from-white via-gray-100 to-gray-200 
    dark:from-slate-900 dark:via-slate-950 dark:to-black 
    transition-all px-4">

      <Toaster position="top-right" />

      {/* Floating Background Blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[350px] h-[350px] rounded-full 
        bg-indigo-500/30 blur-3xl dark:opacity-20" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full
        bg-purple-500/20 blur-3xl dark:opacity-10" />
      </div>

      <div className="relative max-w-4xl mx-auto py-16 z-10">

        {/* Top Bar */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-semibold text-gray-900 dark:text-white">
              Welcome, {user?.name || "User"}
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-300">{user?.email}</p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg
            bg-white/70 dark:bg-slate-900/60 border border-gray-300 dark:border-slate-700
            text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-800
            transition-all shadow"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>

        {/* Rooms List */}
        <div className="space-y-4 mb-10">
          {rooms.length > 0 ? (
            rooms.map((room, i) => (
              <motion.button
                key={room.id}
                onClick={() => router.push(`/canvas/${room.id}`)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="w-full bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl
                border border-gray-200 dark:border-slate-800 
                shadow-lg hover:shadow-xl hover:bg-white dark:hover:bg-slate-900
                p-5 rounded-xl flex justify-between items-center 
                transition-all text-left"
              >
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {room.slug}
                </h2>

                <DoorOpen className="text-indigo-600 dark:text-indigo-400" />
              </motion.button>
            ))
          ) : (
            <p className="text-gray-600 dark:text-gray-300">
              No rooms yet — create one!
            </p>
          )}
        </div>

        {/* Create Room */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3"
        >
          <input
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="Enter room name..."
            className="flex-1 px-4 py-3 rounded-xl border 
            bg-white/80 dark:bg-slate-900/60 
            border-gray-300 dark:border-slate-700
            text-gray-900 dark:text-white focus:ring-2 
            focus:ring-indigo-500 outline-none transition-all"
          />

          <button
            onClick={createRoom}
            disabled={isCreatingRoom}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 
            text-white flex items-center gap-2 shadow transition-all"
          >
            <Plus size={20} />
            {isCreatingRoom ? "Creating..." : "Create"}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
