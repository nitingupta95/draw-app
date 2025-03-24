"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { LogOut, Plus } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { HTTP_BACKEND } from "@/config";
import { useRouter } from "next/navigation";


interface Room {
  id: number;
  slug: string;
}

interface User {
  id: string;
  email: string;
  name?: string;
}

function RoomPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("Authorization");
    const token = storedToken?.startsWith("Bearer ") ? storedToken : `Bearer ${storedToken}`;


    if (!token) {
      toast.error("Session expired. Please login again.");
      router.push("/signin");
      return;
    }
    fetchUserData(token);
  }, []);


  const fetchUserData = async (token: string) => {
    try {
      if (!token) {
        throw new Error("No token found");
      }
  
      console.log("Fetching user data with token:", token);
  
      const response = await axios.get(`${HTTP_BACKEND}/me`, {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });
  
      console.log("Raw response from API:", response);
  
      if (!response.data?.user) {
        throw new Error("Invalid user response format");
      }
  
      setUser(response.data.user);
      setRooms(response.data.rooms || []); // Update rooms state
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  
  
  
  
  



  const handleLogout = () => {
    localStorage.removeItem("Authorization");
    setUser(null);
    setRooms([]);
    router.push("/signin");
  };

  

  const createRoom = async () => {
    if (!newRoomName.trim()) {
      toast.error("Please enter a room name");
      return;
    }
  
    setIsCreatingRoom(true);
    try {
      const storedToken = localStorage.getItem("Authorization");
      if (!storedToken) throw new Error("No authorization token found");
  
      const token = storedToken.startsWith("Bearer ") ? storedToken : `Bearer ${storedToken}`;
  
      const response = await axios.post(
        `${HTTP_BACKEND}/room`,
        { name: newRoomName },
        {
          headers: {
            Authorization: token,  
            "Content-Type": "application/json",
          },
        }
      );
  
      if (!response.data?.room) {
        throw new Error("Invalid API response format");
      }
  
      setRooms((prevRooms) => [...prevRooms, response.data.room]);
      setNewRoomName("");
      toast.success("Room created successfully!");
    } catch (error: any) {
      console.error("Error creating room:", error);
      toast.error(error.response?.data?.message || "Error creating room");
    } finally {
      setIsCreatingRoom(false);
    }
  };
  





  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {user?.name || "User"}
            </h1>
            <p className="text-gray-600 mt-1">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>

        {/* Room List */}
        <div className="space-y-4">
          {rooms.length > 0 ? (
            rooms.map((room) => (
              <button key={room.id} onClick={()=>router.push(`canvas/${room.id}`)} className="p-4 bg-white shadow rounded-md text-black">
                <h2 className="text-lg font-semibold">{room.slug}</h2> 
                
              </button>
            ))
          ) : (
            <p className="text-gray-600">No rooms available. Create one!</p>
          )}
        </div>

        {/* Create Room */}
        <div className="mt-6 flex gap-2">
          <input
            type="text"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="Enter room name"
            className="p-2 border rounded-md flex-1 text-black"
          />
          <button
            onClick={createRoom}
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
            disabled={isCreatingRoom}
          >
            <Plus size={20} /> {isCreatingRoom ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoomPage;
