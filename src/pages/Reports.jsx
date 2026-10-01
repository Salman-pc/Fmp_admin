import React, { useState, useEffect, useCallback } from 'react';
import { reportApi } from '../api/report.api';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Pagination } from '../components/common/Pagination';
import { FileSpreadsheet, Filter } from 'lucide-react';

export const AdminReports = () => {
  const [activeTab, setActiveTab] = useState('LOGS'); // 'LOGS' or 'MEMBER_STATS'
  const [reportData, setReportData] = useState({ records: [], total: 0, page: 1, pages: 1 });
  const [userStats, setUserStats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchLogs = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const res = await reportApi.getAttendanceReport({
        page,
        limit: 10,
        status: statusFilter,
        startDate,
        endDate
      });
      if (res.success && res.data) {
        setReportData(res.data);
      }
    } catch (err) {
      console.error('Error fetching report logs:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, startDate, endDate]);

  const fetchUserStats = async () => {
    try {
      setLoading(true);
      const res = await reportApi.getUserAttendanceStats();
      if (res.success && res.data?.stats) {
        setUserStats(res.data.stats);
      }
    } catch (err) {
      console.error('Error fetching member stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'LOGS') {
      fetchLogs(1);
    } else {
      fetchUserStats();
    }
  }, [activeTab, fetchLogs]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
          <FileSpreadsheet className="w-5 h-5 text-amber-400" />
          <span>Attendance Analytics & Reports</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">Filter daily attendance verification logs and track member presence percentages.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('LOGS')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'LOGS'
              ? 'border-amber-400 text-amber-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Check-In Logs Report
        </button>
        <button
          onClick={() => setActiveTab('MEMBER_STATS')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'MEMBER_STATS'
              ? 'border-amber-400 text-amber-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Member Attendance Percentage Stats
        </button>
      </div>

      {activeTab === 'LOGS' ? (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-slate-300">Filters:</span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg glass-input bg-slate-900 text-xs w-full sm:w-auto"
            >
              <option value="">All Statuses</option>
              <option value="PRESENT">PRESENT</option>
              <option value="REJECTED">REJECTED</option>
            </select>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-slate-400 text-xs">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 rounded-lg glass-input bg-slate-900 text-xs flex-1 sm:w-auto"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-slate-400 text-xs">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 rounded-lg glass-input bg-slate-900 text-xs flex-1 sm:w-auto"
              />
            </div>
          </div>

          {/* Logs Table */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
            {loading ? (
              <LoadingSpinner label="Generating logs report..." />
            ) : reportData.records.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No attendance logs found matching filters.</div>
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
                      <th className="py-3 px-4">Status & Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {reportData.records.map((r) => (
                      <tr key={r._id} className="hover:bg-slate-900/40 transition">
                        <td className="py-3 px-4 font-semibold text-slate-200">{r.user?.name || 'Unknown User'}</td>
                        <td className="py-3 px-4">{r.meeting?.title}</td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                          {new Date(r.checkedInAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}, {new Date(r.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                        </td>
                        <td className="py-3 px-4 font-mono text-amber-400">{r.distance}m</td>
                        <td className="py-3 px-4 font-mono text-slate-400">~{Math.round(r.accuracy)}m</td>
                        <td className="py-3 px-4">
                          <StatusBadge status={r.status} text={r.rejectionReason || r.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <Pagination page={reportData.page} pages={reportData.pages} total={reportData.total} onPageChange={(p) => fetchLogs(p)} />
          </div>
        </div>
      ) : (
        /* Member Stats View */
        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
          {loading ? (
            <LoadingSpinner label="Calculating attendance statistics..." />
          ) : userStats.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No member statistics available.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Member Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Total Meetings</th>
                    <th className="py-3 px-4">Present Count</th>
                    <th className="py-3 px-4">Missed Count</th>
                    <th className="py-3 px-4">Attendance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {userStats.map((item) => (
                    <tr key={item.user._id} className="hover:bg-slate-900/40 transition">
                      <td className="py-3 px-4 font-semibold text-slate-200">{item.user.name}</td>
                      <td className="py-3 px-4 text-slate-400">{item.user.email}</td>
                      <td className="py-3 px-4 font-semibold">{item.totalMeetings}</td>
                      <td className="py-3 px-4 font-semibold text-emerald-400">{item.presentCount}</td>
                      <td className="py-3 px-4 text-rose-400">{item.missedCount}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-amber-500 h-2 rounded-full"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                          <span className="font-bold text-amber-400">{item.percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
