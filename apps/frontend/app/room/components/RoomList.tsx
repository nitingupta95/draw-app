import React from 'react';
import { motion } from 'framer-motion';
import { Search, LayoutGrid, List, ArrowRight, Presentation, Lightbulb, Rocket, Star, Folder } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface Room {
  id: string;
  slug: string;
  name?: string;
  updatedAt?: string;
  admin?: User;
  collaborators?: { user: User }[];
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

const icons = [Presentation, Lightbulb, Rocket, Rocket, Star, Folder];
const colors = [
  "bg-indigo-500", "bg-blue-500", "bg-emerald-500", "bg-amber-400", "bg-pink-400", "bg-purple-500"
];

interface RoomListProps {
  filteredRooms: Room[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function RoomList({ filteredRooms, searchQuery, setSearchQuery }: RoomListProps) {
  const router = useRouter();

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
    </>
  );
}
