import React from 'react';
import Link from 'next/link';
import { LogOut } from 'lucide-react';

interface DashboardHeaderProps {
  setShowLogoutModal: (show: boolean) => void;
}

export function DashboardHeader({ setShowLogoutModal }: DashboardHeaderProps) {
  return (
    <header className="flex justify-between items-center mb-16">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-md">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <span className="font-bold text-lg text-gray-900 tracking-tight">Sketch Collab</span>
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
  );
}
