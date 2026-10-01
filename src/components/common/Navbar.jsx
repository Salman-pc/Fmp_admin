import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Modal } from './Modal';
import { Shield, LogOut, MapPin, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link to="/admin/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-amber-100 to-amber-400">
                GeoCircle Admin
              </span>
              <span className="block text-[10px] text-amber-400 font-medium uppercase tracking-wider">
                Management Portal
              </span>
            </div>
          </Link>

          {/* User profile & Actions */}
          {user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-800">
                <div className="w-8 h-8 rounded-full bg-amber-600/30 border border-amber-400/40 flex items-center justify-center font-bold text-amber-300 text-sm">
                  {user.name ? user.name[0].toUpperCase() : 'A'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-slate-200">{user.name}</div>
                  <div className="text-[10px] text-slate-400 capitalize">{user.role}</div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">
                  ADMIN
                </span>
              </div>

              <button
                onClick={() => setShowLogoutModal(true)}
                title="Logout"
                className="p-2 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirm Admin Logout"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span>Are you sure you want to log out of the GeoCircle Admin Console?</span>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setShowLogoutModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmLogout}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/25 transition"
            >
              Yes, Log Out
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
