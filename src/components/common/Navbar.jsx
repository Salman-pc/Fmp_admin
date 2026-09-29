import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Shield, LogOut, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
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
              onClick={logout}
              title="Logout"
              className="p-2 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
