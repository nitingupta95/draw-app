import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Users, X, ChevronDown, Send, MoreVertical, Link as LinkIcon, Copy } from "lucide-react";
import toast from "react-hot-toast";
import { HTTP_BACKEND } from "@/config";
import { getAvatarColor, SELF_COLOR } from "./utils";

export function CollaboratorModal({ show, onClose, roomId, room, user, onRefresh }: { show: boolean, onClose: () => void, roomId: string, room: any, user: any, onRefresh: () => void }) {
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
                      <div className={`w-10 h-10 rounded-full border-2 border-white ${person.isYou ? SELF_COLOR.bg : getAvatarColor(person.id).bg} text-white flex items-center justify-center font-bold shadow-sm`}>
                        {person.name ? person.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">{person.name}</span>
                          {person.isYou && <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">You</span>}
                        </div>
                        <span className="text-xs text-gray-500">{person.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {person.role === "Owner" ? (
                        <span className="text-sm font-semibold text-primary mr-3">Owner</span>
                      ) : (
                        <div className="relative">
                          <select className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer" defaultValue={person.role === "Can edit" ? "Can edit" : "Can view"}>
                            <option value="Can edit">Can edit</option>
                            <option value="Can view">Can view</option>
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
