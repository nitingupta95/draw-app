import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut } from 'lucide-react';

interface LogoutModalProps {
  showLogoutModal: boolean;
  setShowLogoutModal: (show: boolean) => void;
  handleLogout: () => void;
}

export function LogoutModal({ showLogoutModal, setShowLogoutModal, handleLogout }: LogoutModalProps) {
  return (
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
  );
}
