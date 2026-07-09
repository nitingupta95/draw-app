import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface CreateRoomCardProps {
  newRoomName: string;
  setNewRoomName: (name: string) => void;
  createRoom: () => void;
  isCreatingRoom: boolean;
}

export function CreateRoomCard({
  newRoomName,
  setNewRoomName,
  createRoom,
  isCreatingRoom,
}: CreateRoomCardProps) {
  return (
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

      <div className="flex flex-col sm:flex-row gap-3 relative z-10 max-w-2xl">
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
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-primary text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all disabled:opacity-70 shadow-glow-sm hover:shadow-glow-md"
        >
          <Plus size={18} />
          Create Room
        </button>
      </div>
    </motion.div>
  );
}
