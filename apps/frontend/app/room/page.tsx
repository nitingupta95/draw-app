"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { LogOut, Plus, Search, LayoutGrid, List, MoreVertical, Presentation, Lightbulb, Rocket, Star, Folder, PenSquare, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { HTTP_BACKEND } from "@/config";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Room {
  id: string;
  slug: string;
  name?: string;
  updatedAt?: string;
  admin?: User;
  collaborators?: { user: User }[];
}

interface User {
  id: string;
  email: string;
  name?: string;
}

const icons = [Presentation, Lightbulb, Rocket, Rocket, Star, Folder];
const colors = [
  "bg-indigo-500", "bg-blue-500", "bg-emerald-500", "bg-amber-400", "bg-pink-400", "bg-purple-500"
];

const mockAvatars = [
  "https://i.pravatar.cc/150?u=a",
  "https://i.pravatar.cc/150?u=b",
  "https://i.pravatar.cc/150?u=c",
  "https://i.pravatar.cc/150?u=d",
];

export default function Dashboard() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
    setShowLogoutModal(false);
    localStorage.removeItem("Authorization");
    router.push("/signin");
    toast.success("Logged out successfully");
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
      
      // Refetch user data so the new room includes admin info
      await fetchUserData(token);
      setNewRoomName("");
      toast.success("Room created!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error creating room");
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const filteredRooms = rooms.filter(room => 
    room.slug.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (room.name && room.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getAvatarColor = (id: string) => {
    const avatarColors = [
      "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-green-500", "bg-emerald-500", 
      "bg-teal-500", "bg-cyan-500", "bg-sky-500", "bg-blue-500", "bg-indigo-500", 
      "bg-violet-500", "bg-purple-500", "bg-fuchsia-500", "bg-pink-500", "bg-rose-500"
    ];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return avatarColors[Math.abs(hash) % avatarColors.length];
  };

  return (
    <>
      <div className="min-h-screen bg-[#FDFDFE] relative overflow-hidden font-sans pb-20">

      {/* Decorative Glows */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-purple-400/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 left-1/4 w-[500px] h-[500px] bg-purple-400/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 pt-6 relative z-10">
        {/* TOP BAR */}
        <header className="flex justify-between items-center mb-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-md">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="font-bold text-lg text-gray-900 tracking-tight">Draw App</span>
          </Link>

          <div className="flex items-center gap-4">
             
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-primary hover:bg-gray-50 transition-all shadow-sm"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        {/* HERO GREETING */}
        <div className="text-center mb-8">
          <h1 className="font-display italic text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name?.split(' ')[0] || "User"} 👋
          </h1>
          <p className="text-gray-500">Create a new room or continue collaborating on your whiteboards.</p>
        </div>

        {/* CREATE ROOM CARD */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/60 backdrop-blur-xl border border-white rounded-3xl p-8 mb-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden"
        >
          {/* Subtle inner gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 -z-10" />
          
          {/* Decorative shapes */}
          <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
            <svg width="120" height="120" viewBox="0 0 200 200" fill="none">
              <path d="M40 100 Q40 40 100 40 Q160 40 160 100 Q160 160 100 160 Q40 160 40 100" stroke="#6C5CE7" strokeWidth="4" strokeDasharray="8 8"/>
              <path d="M140 60 L160 40" stroke="#6C5CE7" strokeWidth="4" strokeLinecap="round"/>
              <path d="M120 140 L160 100" stroke="#6C5CE7" strokeWidth="4" strokeLinecap="round"/>
            </svg>
          </div>

          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-primary flex items-center justify-center">
              <Plus size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="font-display italic text-xl font-bold text-gray-900">Create a New Room</h2>
              <p className="text-sm text-gray-500">Start a new collaborative whiteboard.</p>
            </div>
          </div>

          <div className="flex gap-3 relative z-10 max-w-2xl">
            <input
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Enter room name..."
              className="flex-1 px-5 py-3.5 rounded-2xl bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm text-sm"
              onKeyDown={(e) => e.key === 'Enter' && createRoom()}
            />
            <button
              onClick={createRoom}
              disabled={isCreatingRoom}
              className="px-6 py-3.5 rounded-2xl bg-primary text-white text-sm font-semibold flex items-center gap-2 hover:bg-primary-dark transition-all disabled:opacity-70 shadow-glow-sm hover:shadow-glow-md"
            >
              <Plus size={18} />
              Create Room
            </button>
          </div>
        </motion.div>

        {/* YOUR ROOMS HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-gray-900">Your Rooms</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-primary text-xs font-bold">
              {filteredRooms.length}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rooms..." 
                className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-[240px] shadow-sm"
              />
            </div>
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
              <button className="p-1.5 rounded-lg text-primary bg-indigo-50"><LayoutGrid size={16} /></button>
              <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600"><List size={16} /></button>
            </div>
          </div>
        </div>

        {/* ROOMS LIST */}
        <div className="space-y-3">
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room, index) => {
              const Icon = icons[index % icons.length];
              const color = colors[index % colors.length];
              const roomUsers = room.admin ? [room.admin, ...(room.collaborators || []).map(c => c.user)] : [];
              const uniqueRoomUsers = Array.from(new Map(roomUsers.map(u => [u.id, u])).values());
              
              return (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => router.push(`/canvas/${room.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-inner ${color}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-0.5 group-hover:text-primary transition-colors">{room.name || room.slug}</h4>
                      <p className="text-xs text-gray-500">Updated {index === 0 ? '2 min ago' : index === 1 ? 'yesterday' : `${index + 2} days ago`}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    {/* Real Avatar Stack */}
                    <div className="hidden sm:flex items-center -space-x-2">
                      {uniqueRoomUsers.slice(0, 3).map((u, i) => (
                        <div key={u.id} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${getAvatarColor(u.id)}`}>
                          {(u.name || u.email || "?").charAt(0).toUpperCase()}
                        </div>
                      ))}
                      {uniqueRoomUsers.length > 3 && (
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-500 shadow-sm">
                          +{uniqueRoomUsers.length - 3}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button className="px-4 py-2 rounded-xl bg-indigo-50 text-primary text-sm font-semibold flex items-center gap-1.5 group-hover:bg-primary group-hover:text-white transition-colors">
                        Open <ArrowRight size={14} />
                      </button>
                      
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 mx-auto mb-4">
                <Search size={24} className="text-gray-400" />
              </div>
              <h4 className="text-gray-900 font-bold mb-1">{searchQuery ? "No matching rooms" : "No rooms yet"}</h4>
              <p className="text-sm text-gray-500">{searchQuery ? `We couldn't find any rooms matching "${searchQuery}"` : "Create your first room above to get started."}</p>
            </div>
          )}
        </div>

        {filteredRooms.length > 0 && (
          <div className="mt-12 text-center p-8 border border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
            <h4 className="text-gray-900 font-bold mb-1">No more rooms to show</h4>
            <p className="text-sm text-gray-500">All your rooms will appear here.</p>
          </div>
        )}

      </div>
    </div>

    {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-[400px] bg-white rounded-3xl shadow-2xl p-6 relative"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
                  <LogOut size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to leave?</h3>
                <p className="text-sm text-gray-500 mb-6">Are you sure you want to log out of your account?</p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors shadow-sm"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
