import React from 'react';
import { Outlet } from 'react-router-dom';
import { Shield } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-2">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500">
            GeoCircle Admin Portal
          </h1>
          <p className="text-xs text-slate-400">
            Secure Administrator Management Console
          </p>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-2xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
