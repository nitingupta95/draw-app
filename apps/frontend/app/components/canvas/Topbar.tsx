import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { HTTP_BACKEND } from "@/config";
import { getAvatarColor, SELF_COLOR } from "./utils";
import { CollaboratorModal } from "./CollaboratorModal";

export function Topbar({ roomId }: { roomId: string }) {
  const [showModal, setShowModal] = useState(false);
  const [room, setRoom] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  const fetchRoomData = async () => {
    let token = localStorage.getItem("Authorization");
    if (!token) return;
    token = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    try {
      const roomRes = await fetch(`${HTTP_BACKEND}/rooms/${roomId}/details`, { headers: { Authorization: token } });
      if (roomRes.ok) {
        const roomData = await roomRes.json();
        setRoom(roomData.room);
      }
    } catch (err) {}
  };

  useEffect(() => {
    async function fetchData() {
      let token = localStorage.getItem("Authorization");
      if (!token) return;
      token = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
      
      try {
        const [roomRes, userRes] = await Promise.all([
          fetch(`${HTTP_BACKEND}/rooms/${roomId}/details`, { headers: { Authorization: token } }),
          fetch(`${HTTP_BACKEND}/me`, { headers: { Authorization: token } })
        ]);
        if (roomRes.ok) {
          const roomData = await roomRes.json();
          setRoom(roomData.room);
        }
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData.user);
        }
      } catch (err) {
        console.error("Failed to fetch topbar data", err);
      }
    }
    fetchData();
  }, [roomId]);

  const collaboratorsList = room ? [room.admin, ...room.collaborators.map((c: any) => c.user)] : [];

  return (
    <>
      <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between px-5 py-3 bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl shadow-sm">
        
        {/* Left: Logo & Room Name */}
        <div className="flex items-center gap-3 sm:gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center shadow-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="font-bold text-gray-900 tracking-tight hidden sm:inline">Sketch Collab</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-primary uppercase ml-1 tracking-wider hidden sm:inline">Beta</span>
          </Link>

          <div className="h-6 w-px bg-gray-200" />

          <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">
            <span className="font-semibold text-sm text-gray-800">{room?.name || "Loading..."}</span>
          </button>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Avatar Stack */}
          <div className="hidden sm:flex items-center -space-x-2">
            {collaboratorsList.slice(0, 3).map((collab: any) => {
              const isSelf = collab.id === user?.id;
              const color = isSelf ? SELF_COLOR : getAvatarColor(collab.id);
              return (
                <div 
                  key={collab.id} 
                  title={`${collab.name}${isSelf ? ' (You)' : ''}`}
                  className={`w-7 h-7 rounded-full border-2 border-white ${color.bg} text-white flex items-center justify-center font-bold text-[10px] shadow-sm`}
                >
                  {collab.name ? collab.name.charAt(0).toUpperCase() : "U"}
                </div>
              );
            })}
            {collaboratorsList.length > 3 && (
              <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                +{collaboratorsList.length - 3}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowModal(true)}
            disabled={room && user ? room.admin?.id !== user.id : true}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              room && user && room.admin?.id === user.id
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-glow-sm hover:shadow-glow-md"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Plus size={16} /> <span className="hidden sm:inline">Add Collaborator</span>
          </button>

          <Link
            href="/room"
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 text-sm font-semibold hover:bg-teal-100 transition-all shadow-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            <span className="hidden sm:inline">Go to Room</span>
          </Link>

          <div className="h-6 w-px bg-gray-200 ml-2" />
          
          {user ? (
            <div 
              title={`${user.name} (You)`}
              className={`w-8 h-8 rounded-full border-2 border-white ${SELF_COLOR.bg} text-white flex items-center justify-center cursor-pointer hover:ring-2 ${SELF_COLOR.ring} transition-all ml-2 font-bold text-xs shadow-sm`}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full border border-gray-200 bg-gray-200 ml-2 animate-pulse" />
          )}
        </div>
      </div>

      <CollaboratorModal 
        show={showModal} 
        onClose={() => setShowModal(false)} 
        roomId={roomId} 
        room={room} 
        user={user}
        onRefresh={fetchRoomData} 
      />
    </>
  );
}
