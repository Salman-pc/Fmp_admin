import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle, Shield } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const AdminLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const res = await login(data);
      if (res.user?.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        setError('Access denied: You must be an administrator.');
      }
    } catch (err) {
      setError(err.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-100 mb-1">Admin Sign In</h2>
      <p className="text-xs text-slate-400 mb-6">Enter your administrator credentials to access the console.</p>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Email</label>
          <input
            type="email"
            placeholder="admin@geocircle.com"
            {...register('email')}
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
          />
          {errors.email && (
            <p className="text-[11px] text-rose-400 mt-1 font-medium">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            {...register('password')}
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
          />
          {errors.password && (
            <p className="text-[11px] text-rose-400 mt-1 font-medium">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-semibold text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center space-x-2 disabled:opacity-50 transition"
        >
          {loading ? (
            <span>Authenticating...</span>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Sign In as Admin</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
