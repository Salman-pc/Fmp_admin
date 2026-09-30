import React, { useState, useEffect, useCallback } from 'react';
import { meetingApi } from '../api/meeting.api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Pagination } from '../components/common/Pagination';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/StatusBadge';
import { MapPicker } from '../components/location/MapPicker';
import { Calendar, Plus, MapPin, Clock, Trash2, Edit2, CheckSquare, Square, Repeat, CalendarDays } from 'lucide-react';

const DAYS = [
  { id: 0, label: 'Sun', full: 'Sunday' },
  { id: 1, label: 'Mon', full: 'Monday' },
  { id: 2, label: 'Tue', full: 'Tuesday' },
  { id: 3, label: 'Wed', full: 'Wednesday' },
  { id: 4, label: 'Thu', full: 'Thursday' },
  { id: 5, label: 'Fri', full: 'Friday' },
  { id: 6, label: 'Sat', full: 'Saturday' }
];

export const format12Hour = (time24Str) => {
  if (!time24Str) return '';
  const [hStr, mStr] = time24Str.split(':');
  let h = parseInt(hStr, 10);
  if (isNaN(h)) return time24Str;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${mStr || '00'} ${ampm}`;
};

export const AdminMeetings = () => {
  const [data, setData] = useState({ meetings: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    locationName: '',
    latitude: 10.0261,
    longitude: 76.3082,
    radius: 100,
    checkInEnabled: true,
    scheduleType: 'EVERYDAY',
    recurringDays: [1, 2, 3, 4, 5],
    isTimeWindowOptional: false,
    startTime: '18:00',
    endTime: '18:30',
    date: new Date().toISOString().split('T')[0],
    timezone: 'Asia/Kolkata'
  });
  const [formError, setFormError] = useState(null);

  const fetchMeetings = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const res = await meetingApi.getAll({ page, limit: 10 });
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching meetings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeetings(1);
  }, [fetchMeetings]);

  const handleOpenCreate = () => {
    setEditingMeeting(null);
    setFormData({
      title: '',
      description: '',
      locationName: 'Lulu Mall',
      latitude: 10.0261,
      longitude: 76.3082,
      radius: 100,
      checkInEnabled: true,
      scheduleType: 'EVERYDAY',
      recurringDays: [1, 2, 3, 4, 5],
      isTimeWindowOptional: false,
      startTime: '18:00',
      endTime: '18:30',
      date: new Date().toISOString().split('T')[0],
      timezone: 'Asia/Kolkata'
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (meeting) => {
    setEditingMeeting(meeting);
    const [lon, lat] = meeting.location?.coordinates || [76.3082, 10.0261];
    setFormData({
      title: meeting.title,
      description: meeting.description || '',
      locationName: meeting.locationName,
      latitude: lat,
      longitude: lon,
      radius: meeting.radius,
      checkInEnabled: meeting.checkInEnabled,
      scheduleType: meeting.scheduleType || 'SPECIFIC_DATE',
      recurringDays: meeting.recurringDays || [1, 2, 3, 4, 5],
      isTimeWindowOptional: Boolean(meeting.isTimeWindowOptional),
      startTime: meeting.startTime || '18:00',
      endTime: meeting.endTime || '18:30',
      date: meeting.date ? new Date(meeting.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      timezone: meeting.timezone || 'Asia/Kolkata'
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const toggleRecurringDay = (dayId) => {
    setFormData((prev) => {
      const exists = prev.recurringDays.includes(dayId);
      const nextDays = exists
        ? prev.recurringDays.filter((d) => d !== dayId)
        : [...prev.recurringDays, dayId].sort((a, b) => a - b);
      return { ...prev, recurringDays: nextDays };
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (formData.scheduleType === 'WEEKLY' && formData.recurringDays.length === 0) {
      setFormError('Please select at least one day for weekly recurring schedule.');
      return;
    }

    try {
      if (editingMeeting) {
        await meetingApi.update(editingMeeting._id, formData);
      } else {
        await meetingApi.create(formData);
      }
      setIsModalOpen(false);
      fetchMeetings(data.page);
    } catch (err) {
      setFormError(err.message || 'Failed to save meeting parameters');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this meeting configuration?')) return;
    try {
      await meetingApi.delete(id);
      fetchMeetings(data.page);
    } catch (err) {
      alert(err.message || 'Failed to delete meeting');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <span>Meeting Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure target location, GeoJSON radius, schedule rules & 12-hour AM/PM time windows.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white font-semibold text-xs shadow-lg shadow-amber-500/20 flex items-center space-x-2 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Meeting</span>
        </button>
      </div>

      {/* Meetings Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        {loading ? (
          <LoadingSpinner label="Loading configured meetings..." />
        ) : data.meetings.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No meetings created yet. Click above to create one.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Title & Location</th>
                  <th className="py-3 px-4">Coordinates & Radius</th>
                  <th className="py-3 px-4">Schedule Pattern</th>
                  <th className="py-3 px-4">Time Window (AM/PM)</th>
                  <th className="py-3 px-4">Check-In</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {data.meetings.map((m) => {
                  const [lon, lat] = m.location?.coordinates || [0, 0];
                  
                  let scheduleBadge = 'Everyday';
                  if (m.scheduleType === 'WEEKLY') {
                    const dayLabels = (m.recurringDays || []).map((d) => DAYS.find((item) => item.id === d)?.label).join(', ');
                    scheduleBadge = `Weekly: ${dayLabels || 'None'}`;
                  } else if (m.scheduleType === 'SPECIFIC_DATE') {
                    scheduleBadge = m.date ? `Date: ${new Date(m.date).toLocaleDateString()}` : 'Specific Date';
                  }

                  return (
                    <tr key={m._id} className="hover:bg-slate-900/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{m.title}</div>
                        <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-amber-400" />
                          <span>{m.locationName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-[11px] text-slate-400">{lat.toFixed(4)}, {lon.toFixed(4)}</div>
                        <div className="font-semibold text-amber-400 text-[11px]">{m.radius}m allowed</div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-amber-300 font-medium text-[11px] inline-flex items-center space-x-1">
                          <Repeat className="w-3 h-3 text-amber-400" />
                          <span>{scheduleBadge}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {m.isTimeWindowOptional ? (
                          <span className="text-emerald-400 font-semibold text-[11px]">✨ Open Anytime Today</span>
                        ) : (
                          <div className="text-[11px] text-slate-300 flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>
                              {format12Hour(m.startTime)} – {format12Hour(m.endTime)}
                            </span>
                            <span className="text-slate-500">({m.timezone})</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={m.checkInEnabled ? 'ACTIVE' : 'EXPIRED_WINDOW'} text={m.checkInEnabled ? 'ENABLED' : 'DISABLED'} />
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(m)}
                          className="p-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 transition"
                          title="Edit Meeting"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(m._id)}
                          className="p-1.5 rounded-lg border border-rose-500/20 hover:bg-rose-500/10 text-rose-400 transition"
                          title="Delete Meeting"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={data.page} pages={data.pages} total={data.total} onPageChange={(p) => fetchMeetings(p)} />
      </div>

      {/* Modal for Create/Edit Meeting */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMeeting ? 'Edit Meeting Configuration' : 'Create Meeting Configuration'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Meeting Title</label>
            <input
              type="text"
              required
              placeholder="Weekend Meetup"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Location Name</label>
            <input
              type="text"
              required
              placeholder="Lulu Mall, Kochi"
              value={formData.locationName}
              onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            />
          </div>

          {/* Interactive Map Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Location Coordinates & Radius Visualizer
            </label>
            <MapPicker
              latitude={formData.latitude}
              longitude={formData.longitude}
              radius={Number(formData.radius)}
              onSelectLocation={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                required
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                required
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Radius (meters)</label>
              <input
                type="number"
                min="5"
                required
                value={formData.radius}
                onChange={(e) => setFormData({ ...formData, radius: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs font-semibold text-amber-400"
              />
            </div>
          </div>

          {/* Schedule Frequency Rules */}
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">
            <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
              1. Meeting Schedule Frequency
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, scheduleType: 'EVERYDAY' })}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
                  formData.scheduleType === 'EVERYDAY'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>Everyday</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, scheduleType: 'SPECIFIC_DATE' })}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
                  formData.scheduleType === 'SPECIFIC_DATE'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Specific Date</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, scheduleType: 'WEEKLY' })}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
                  formData.scheduleType === 'WEEKLY'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Selected Days</span>
              </button>
            </div>

            {/* If SPECIFIC_DATE: Show Date Picker */}
            {formData.scheduleType === 'SPECIFIC_DATE' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Meeting Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-slate-900"
                />
              </div>
            )}

            {/* If WEEKLY: Show Days Selector */}
            {formData.scheduleType === 'WEEKLY' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Active Check-In Days of the Week:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {DAYS.map((d) => {
                    const isSelected = formData.recurringDays.includes(d.id);
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => toggleRecurringDay(d.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md'
                            : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Time Window Settings (AM / PM) */}
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                2. Check-in Time Window (AM / PM)
              </label>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isTimeWindowOptional"
                  checked={formData.isTimeWindowOptional}
                  onChange={(e) => setFormData({ ...formData, isTimeWindowOptional: e.target.checked })}
                  className="w-4 h-4 text-amber-500 rounded bg-slate-900 border-slate-700"
                />
                <label htmlFor="isTimeWindowOptional" className="text-xs font-semibold text-emerald-400 cursor-pointer">
                  Optional Time Window (Open Anytime Today)
                </label>
              </div>
            </div>

            {!formData.isTimeWindowOptional && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                      <span>Start Time (AM/PM)</span>
                      <span className="text-[11px] text-amber-400 font-mono">{format12Hour(formData.startTime)}</span>
                    </label>
                    <input
                      type="time"
                      required={!formData.isTimeWindowOptional}
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                      <span>End Time (AM/PM)</span>
                      <span className="text-[11px] text-amber-400 font-mono">{format12Hour(formData.endTime)}</span>
                    </label>
                    <input
                      type="time"
                      required={!formData.isTimeWindowOptional}
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-slate-900"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between">
                  <span>Enforced Time Window Preview:</span>
                  <span className="font-semibold text-amber-300 font-mono">
                    {format12Hour(formData.startTime)} – {format12Hour(formData.endTime)}
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Timezone</label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs bg-slate-900"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (India Standard Time)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (BST/GMT)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="checkInEnabled"
              checked={formData.checkInEnabled}
              onChange={(e) => setFormData({ ...formData, checkInEnabled: e.target.checked })}
              className="w-4 h-4 text-amber-500 rounded bg-slate-900 border-slate-700"
            />
            <label htmlFor="checkInEnabled" className="text-xs font-semibold text-slate-300 cursor-pointer">
              Enable Check-In for this meeting immediately
            </label>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-500/20"
            >
              {editingMeeting ? 'Save Meeting' : 'Create Meeting'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
