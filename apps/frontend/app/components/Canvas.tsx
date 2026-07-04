"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  MousePointer2,
  Hand,
  Circle,
  Diamond,
  Pencil,
  Square,
  Eraser,
  Type,
  X,
  Undo2,
  Redo2,
  Cloud,
  ChevronDown,
  Users,
  Send,
  MoreVertical,
  Link as LinkIcon,
  Copy,
  Minus,
  Plus,
  Maximize
} from "lucide-react";
import { Game, Tool } from "../draw/Game";
import { AnimatePresence, motion } from "framer-motion";
import { HTTP_BACKEND } from "@/config";  
import toast from "react-hot-toast";
import Link from "next/link";

const mockCollaborators = [
  { id: 1, name: "Nitin Gupta", email: "ng61315@gmail.com", role: "Owner", isYou: true, avatar: "https://i.pravatar.cc/150?u=a" },
  { id: 2, name: "Priya Sharma", email: "priya.sharma@gmail.com", role: "Can edit", isYou: false, avatar: "https://i.pravatar.cc/150?u=b" },
  { id: 3, name: "Arjun Mehta", email: "arjun.mehta@gmail.com", role: "Can edit", isYou: false, avatar: "https://i.pravatar.cc/150?u=c" },
  { id: 4, name: "Riya Patel", email: "riya.patel@gmail.com", role: "Can view", isYou: false, avatar: "https://i.pravatar.cc/150?u=d" },
];

export function Canvas({ roomId, socket }: { socket: WebSocket; roomId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<Game>();
  const [selectedTool, setSelectedTool] = useState<Tool>("select");
  const [canEdit, setCanEdit] = useState<boolean>(true);

  // BLOCK USERS WHO ARE NOT ADMIN OR COLLABORATOR
  useEffect(() => {
    async function checkAccess() {
      const token = localStorage.getItem("Authorization");
      const res = await fetch(`${HTTP_BACKEND}/rooms/${roomId}/access`, {
        headers: { Authorization: `Bearer ${token} ?? ` },
      });

      if (res.status === 403) {
        const passcode = window.prompt("This room requires a passcode to join. Please enter it below (leave blank if none):");
        if (passcode !== null) {
          try {
            const joinRes = await fetch(`${HTTP_BACKEND}/rooms/${roomId}/join`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
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
    return () => g.destory();
  }, [canvasRef, roomId, socket]);

  useEffect(() => {
    function handleResize() {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      requestAnimationFrame(() => {});
    }
    window.addEventListener("resize", handleResize);
    handleResize(); 
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-[#FDFDFE] font-sans">

      {/* Decorative Glows for the Canvas Background */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-purple-400/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-[500px] h-[500px] bg-indigo-400/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        className="absolute inset-0 cursor-crosshair"
      />

      {/* Top Navbar */}
      <Topbar roomId={roomId} />

      {/* Floating Drawing Toolbar */}
      <FloatingToolbar selectedTool={selectedTool} setSelectedTool={setSelectedTool} canEdit={canEdit} />
      <ZoomControls />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  TOP BAR                                   */
/* -------------------------------------------------------------------------- */
function Topbar({ roomId }: { roomId: string }) {
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
      // In case token doesn't have Bearer prefix yet
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
            <span className="font-bold text-gray-900 tracking-tight hidden sm:inline">Draw App</span>
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
            {collaboratorsList.slice(0, 3).map((collab: any) => (
              <div 
                key={collab.id} 
                title={collab.name}
                className="w-7 h-7 rounded-full border-2 border-white bg-indigo-500 text-white flex items-center justify-center font-bold text-[10px] shadow-sm"
              >
                {collab.name ? collab.name.charAt(0).toUpperCase() : "U"}
              </div>
            ))}
            {collaboratorsList.length > 3 && (
              <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-500">
                +{collaboratorsList.length - 3}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all shadow-glow-sm hover:shadow-glow-md"
          >
            <Plus size={16} /> <span className="hidden sm:inline">Add Collaborator</span>
          </button>

          <Link
            href="/room"
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-white border border-gray-200 text-primary text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            <span className="hidden sm:inline">Go to Room</span>
          </Link>

          <div className="h-6 w-px bg-gray-200 ml-2" />
          
          {user ? (
            <div 
              title={user.name}
              className="w-8 h-8 rounded-full border border-gray-200 bg-primary text-white flex items-center justify-center cursor-pointer hover:ring-2 ring-primary/30 transition-all ml-2 font-bold text-xs shadow-sm"
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

/* -------------------------------------------------------------------------- */
/*                              FLOATING TOOLBAR                              */
/* -------------------------------------------------------------------------- */
function FloatingToolbar({ selectedTool, setSelectedTool, canEdit }: { selectedTool: Tool, setSelectedTool: (s: Tool) => void, canEdit: boolean }) {
  const tools = [
    { id: "select", icon: <MousePointer2 size={18} /> },
    { id: "hand", icon: <Hand size={18} /> },
    { id: "pencil", icon: <Pencil size={18} /> },
    { id: "rect", icon: <Square size={18} /> },
    { id: "ellipse", icon: <Circle size={18} /> },
    { id: "diamond", icon: <Diamond size={18} /> },
    { id: "arrow", icon: <ArrowRight size={18} /> },
    { id: "text", icon: <Type size={18} /> },
    { id: "eraser", icon: <Eraser size={18} /> },
  ] as const;

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute top-24 sm:top-28 left-1/2 -translate-x-1/2 z-40 flex flex-wrap justify-center items-center gap-1 sm:gap-1.5 p-2 sm:px-3 sm:py-2 rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 w-fit max-w-[90vw] sm:max-w-max"
    >
      {tools.map((tool) => {
        const isDrawingTool = tool.id !== "select" && tool.id !== "hand";
        const disabled = !canEdit && isDrawingTool;
        return (
          <button
            key={tool.id}
            disabled={disabled}
            onClick={() => setSelectedTool(tool.id as Tool)}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all ${
              selectedTool === tool.id 
                ? "bg-indigo-100 text-primary shadow-sm" 
                : disabled 
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {tool.icon}
          </button>
        );
      })}

      <div className="w-px h-6 bg-gray-200 mx-0 sm:mx-1 hidden sm:block" />
      
      <button disabled={!canEdit} className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all ${!canEdit ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'}`}>
        <Undo2 size={18} />
      </button>
      <button disabled={!canEdit} className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all ${!canEdit ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'}`}>
        <Redo2 size={18} />
      </button>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               ZOOM CONTROLS                                */
/* -------------------------------------------------------------------------- */
function ZoomControls() {
  return (
    <div className="absolute bottom-6 left-6 z-40 flex items-center gap-1 px-2 py-1.5 bg-white rounded-xl shadow-md border border-gray-100">
      <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">
        <Minus size={16} />
      </button>
      <span className="text-xs font-semibold text-gray-700 w-12 text-center">100%</span>
      <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">
        <Plus size={16} />
      </button>
      <div className="w-px h-4 bg-gray-200 mx-1" />
      <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">
        <Maximize size={16} />
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            COLLABORATOR MODAL                              */
/* -------------------------------------------------------------------------- */
function CollaboratorModal({ show, onClose, roomId, room, user, onRefresh }: { show: boolean, onClose: () => void, roomId: string, room: any, user: any, onRefresh: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [canEdit, setCanEdit] = useState(true);

  async function handleAdd() {
    if (!email.trim()) return toast.error("Please enter an email");
    setLoading(true);
    try {
      const fetchedUser = await fetch(`${HTTP_BACKEND}/find-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }).then((r) => r.json());

      if (!fetchedUser?.id) {
        toast.success(`Invite sent to ${email}!`);
        setEmail("");
        return;
      }
      const token = localStorage.getItem("Authorization");
      await fetch(`${HTTP_BACKEND}/rooms/${roomId}/collaborators`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: fetchedUser.id, canEdit }),
      });
      toast.success("Collaborator added!");
      setEmail("");
      onRefresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-[550px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 pb-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-primary flex items-center justify-center">
                  <Users size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Add Collaborators</h2>
                  <p className="text-sm text-gray-500 mt-1">Invite people to collaborate in this room.</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Invite Input Section */}
            <div className="px-6 py-4 flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="email"
                  placeholder="Enter email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-gray-400"
                />
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </div>
              <div className="relative">
                <select 
                  value={canEdit ? "edit" : "view"}
                  onChange={(e) => setCanEdit(e.target.value === "edit")}
                  className="appearance-none pl-4 pr-8 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer h-full">
                  <option value="edit">Can edit</option>
                  <option value="view">Can view</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
              <button
                onClick={handleAdd}
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm flex items-center gap-2 hover:bg-primary-dark transition-all disabled:opacity-70 shadow-glow-sm"
              >
                <Send size={16} />
                {loading ? "..." : "Invite"}
              </button>
            </div>

            {/* People List */}
            <div className="px-6 py-2 flex-1 overflow-y-auto">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-gray-900">People in this room</h3>
                <span className="text-xs text-gray-500">{room ? room.collaborators.length + 1 : 0} members</span>
              </div>
              
              <div className="border border-gray-100 rounded-2xl p-1 bg-white">
                {room && [
                  { ...room.admin, role: "Owner", isYou: room.admin.id === user?.id },
                  ...room.collaborators.map((c: any) => ({
                    ...c.user,
                    role: c.canEdit ? "Can edit" : "Can view",
                    isYou: c.user.id === user?.id
                  }))
                ].map((person) => (
                  <div key={person.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-indigo-500 text-white flex items-center justify-center font-bold shadow-sm">
                        {person.name ? person.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">{person.name}</span>
                          {person.isYou && <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-primary text-[10px] font-bold">You</span>}
                        </div>
                        <span className="text-xs text-gray-500">{person.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {person.role === "Owner" ? (
                        <span className="text-sm font-semibold text-primary mr-3">Owner</span>
                      ) : (
                        <div className="relative">
                          <select className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
                            <option selected={person.role === "Can edit"}>Can edit</option>
                            <option selected={person.role === "Can view"}>Can view</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                        </div>
                      )}
                      {!person.isYou && (
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                          <MoreVertical size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Link Box */}
            <div className="p-6 pt-4 bg-[#FDFDFE] border-t border-gray-100 mt-2">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-indigo-100 text-primary flex items-center justify-center">
                    <LinkIcon size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Invite link</h4>
                    <p className="text-xs text-gray-500">Anyone with this link can join</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const link = `${window.location.origin}/canvas/${roomId}`;
                    const textToCopy = room?.passcode ? `${link}\nPasscode: ${room.passcode}` : link;
                    navigator.clipboard.writeText(textToCopy);
                    toast.success(room?.passcode ? "Link & passcode copied!" : "Link copied!");
                  }}
                  className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark transition-colors px-2 py-1">
                  Copy link <Copy size={16} />
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
