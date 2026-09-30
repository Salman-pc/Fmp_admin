import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileSpreadsheet,
  Gamepad2
} from 'lucide-react';

export const Sidebar = () => {
  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Users Management', icon: Users },
    { to: '/admin/meetings', label: 'Meetings Setup', icon: Calendar },
    { to: '/admin/reports', label: 'Attendance Reports', icon: FileSpreadsheet },
    { to: '/admin/games', label: 'Games Config', icon: Gamepad2 }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 glass-panel border-r border-slate-800 p-4 hidden md:block min-h-[calc(100vh-4rem)]">
        <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider px-3 mb-3">
          Admin Console
        </div>
        <nav className="space-y-1">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold shadow-inner'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Horizontal Navigation Header Scrollbar (< md screens) */}
      <div className="md:hidden w-full glass-panel border-b border-slate-800 px-3 py-2 overflow-x-auto no-scrollbar">
        <nav className="flex items-center space-x-2 min-w-max">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </>
  );
};
