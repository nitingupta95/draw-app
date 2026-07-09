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
import { useAuthStore } from "@/lib/store/authStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const fetchUserData = async (token: string) => {
  const response = await axios.get(`${HTTP_BACKEND}/me`, {
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
  });
  if (!response.data?.user) throw new Error("Invalid user data");
  return response.data;
};

export default function Dashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { token, logout, isHydrated } = useAuthStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (isHydrated && !token) {
      toast.error("Session expired. Please login again.");
      router.push("/signin");
    }
  }, [token, isHydrated, router]);

  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => {
      const activeToken = token?.startsWith("Bearer ") ? token : `Bearer ${token}`;
      return fetchUserData(activeToken!);
    },
    enabled: !!token,
  });

  const createRoomMutation = useMutation({
    mutationFn: async (name: string) => {
      const activeToken = token?.startsWith("Bearer ") ? token : `Bearer ${token}`;
      const response = await axios.post(
        `${HTTP_BACKEND}/room`,
        { name },
        { headers: { Authorization: activeToken } }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      setNewRoomName("");
      toast.success("Room created!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Error creating room");
    }
  });

  const handleLogout = () => {
    setShowLogoutModal(false);
    logout();
    router.push("/signin");
    toast.success("Logged out successfully");
  };

  const createRoom = () => {
    if (!newRoomName.trim()) return toast.error("Enter a valid room name");
    createRoomMutation.mutate(newRoomName);
  };

  const user = data?.user;
  const rooms = data?.rooms || [];

  const filteredRooms = rooms.filter((room: Room) => 
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
            isCreatingRoom={createRoomMutation.isPending}
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
