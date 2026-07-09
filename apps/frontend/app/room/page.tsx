"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { HTTP_BACKEND } from "@/config";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "./components/DashboardHeader";
import { CreateRoomCard } from "./components/CreateRoomCard";
import { RoomList, Room, User } from "./components/RoomList";
import { LogoutModal } from "./components/LogoutModal";

export default function Dashboard() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

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
    } finally {
      setIsLoading(false);
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

  return (
    <>
      <div className="min-h-screen bg-[#FDFDFE] relative overflow-hidden font-sans pb-20">

        {/* Decorative Glows */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-purple-400/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 left-1/4 w-[500px] h-[500px] bg-purple-400/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 pt-6 relative z-10">
          <DashboardHeader setShowLogoutModal={setShowLogoutModal} />

          {/* HERO GREETING */}
          {isLoading ? (
            <div className="text-center mb-8 h-20 flex items-center justify-center">
               <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="text-center mb-8">
              <h1 className="font-display italic text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.name?.split(' ')[0] || "User"} 👋
              </h1>
              <p className="text-gray-500">Create a new room or continue collaborating on your whiteboards.</p>
            </div>
          )}

          <CreateRoomCard 
            newRoomName={newRoomName}
            setNewRoomName={setNewRoomName}
            createRoom={createRoom}
            isCreatingRoom={isCreatingRoom}
          />

          {isLoading ? (
            <div className="mt-12 flex flex-col items-center justify-center text-muted-foreground space-y-4">
               <div className="w-10 h-10 border-4 border-primary/40 border-t-primary rounded-full animate-spin"></div>
               <p className="font-medium">Loading your rooms...</p>
            </div>
          ) : (
            <RoomList 
              filteredRooms={filteredRooms}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}
        </div>
      </div>

      <LogoutModal 
        showLogoutModal={showLogoutModal}
        setShowLogoutModal={setShowLogoutModal}
        handleLogout={handleLogout}
      />
    </>
  );
}
