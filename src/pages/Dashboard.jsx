import React, { useState, useEffect } from 'react';
import { reportApi } from '../api/report.api';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Users, UserCheck, UserX, Calendar, CheckCircle2, MapPin, Activity } from 'lucide-react';

const format12Hour = (time24Str) => {
  if (!time24Str) return '';
  const [hStr, mStr] = time24Str.split(':');
  let h = parseInt(hStr, 10);
  if (isNaN(h)) return time24Str;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${mStr || '00'} ${ampm}`;
};

export const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await reportApi.getDashboardSummary();
        if (res.success && res.data) {
          setSummary(res.data);
        }
      } catch (err) {
        console.error('Error loading dashboard summary:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <LoadingSpinner size="lg" label="Loading admin analytics dashboard..." />;

  const cards = [
    { title: 'Total Users', value: summary?.totalUsers || 0, icon: Users, color: 'from-amber-500 to-orange-500' },
    { title: 'Active Members', value: summary?.activeUsers || 0, icon: UserCheck, color: 'from-cyan-500 to-teal-500' },
    { title: 'Present Today', value: summary?.presentToday || 0, icon: CheckCircle2, color: 'from-emerald-500 to-green-500' },
    { title: 'Not Checked In', value: summary?.notCheckedInToday || 0, icon: UserX, color: 'from-rose-500 to-red-500' },
    { title: 'Total Check-Ins', value: summary?.totalCheckIns || 0, icon: Activity, color: 'from-purple-500 to-indigo-500' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100">Admin Overview</h1>
        <p className="text-xs text-slate-400 mt-0.5">Real-time attendance metrics and meeting presence statistics.</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">{card.title}</span>
                <div className={`p-2 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-md`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white">{card.value}</div>
            </div>
          );
        })}
      </div>

      {/* Active Meeting Card */}
      {summary?.activeMeeting && (
        <div className="glass-panel rounded-2xl p-5 border border-amber-500/20 bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-900">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Active Meeting</span>
              <h3 className="text-lg font-bold text-white">{summary.activeMeeting.title}</h3>
              <p className="text-xs text-slate-400 flex items-center space-x-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{summary.activeMeeting.locationName} ({summary.activeMeeting.radius}m allowed radius)</span>
              </p>
            </div>
            <div className="text-xs text-slate-300 font-medium">
              Window: <span className="font-semibold text-amber-400">{summary.activeMeeting.isTimeWindowOptional ? 'Open Anytime Today' : `${format12Hour(summary.activeMeeting.startTime)} - ${format12Hour(summary.activeMeeting.endTime)}`}</span> ({summary.activeMeeting.timezone})
            </div>
          </div>
        </div>
      )}

      {/* Recent Check-Ins Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="p-4 border-b border-slate-800 font-semibold text-sm text-slate-200">
          Recent Check-In Activity
        </div>

        {!summary?.recentCheckIns?.length ? (
          <div className="p-6 text-center text-xs text-slate-400">No check-ins recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Meeting</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Distance</th>
                  <th className="py-3 px-4">Accuracy</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {summary.recentCheckIns.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-4 font-semibold text-slate-200">{item.user?.name || 'Unknown User'}</td>
                    <td className="py-3 px-4">{item.meeting?.title}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(item.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-amber-400">{item.distance}m</td>
                    <td className="py-3 px-4 text-slate-400 font-mono">~{Math.round(item.accuracy)}m</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={item.status} text={item.rejectionReason || item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
