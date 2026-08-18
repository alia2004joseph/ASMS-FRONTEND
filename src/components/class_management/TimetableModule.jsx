import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { TimetableEntry, DayOfWeek } from '../../types';
import { useNotifications } from '../../context/NotificationContext';
import { Calendar, Clock, MapPin, User, Send, Filter, BookOpen } from 'lucide-react';
import { Badge } from '../common/Badge';

export const TimetableModule: React.FC = () => {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | 'ALL'>('ALL');
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);
  const { showToast } = useNotifications();

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const data = await api.getTimetable();
      setTimetable(data);
    } catch (err) {
      console.error('Failed to load timetable:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async (tt: TimetableEntry) => {
    try {
      setSendingReminderId(tt.id);
      const res = await api.sendTimetableReminder(tt.id);
      showToast(
        'Email Reminder Triggered',
        `Class reminder for ${tt.classroom_subject?.subject?.code || 'Course'} sent to ${res.count} enrolled students.`,
        'success'
      );
    } catch {
      showToast('Error', 'Failed to dispatch email reminder.', 'error');
    } finally {
      setSendingReminderId(null);
    }
  };

  const days: { id: DayOfWeek | 'ALL'; label: string }[] = [
    { id: 'ALL', label: 'All Days' },
    { id: 'MONDAY', label: 'Monday' },
    { id: 'TUESDAY', label: 'Tuesday' },
    { id: 'WEDNESDAY', label: 'Wednesday' },
    { id: 'THURSDAY', label: 'Thursday' },
    { id: 'FRIDAY', label: 'Friday' },
  ];

  const filtered = selectedDay === 'ALL' ? timetable : timetable.filter((t) => t.day_of_week === selectedDay);

  const getDayBadge = (day: DayOfWeek) => {
    switch (day) {
      case 'MONDAY':
        return <Badge variant="info">Monday</Badge>;
      case 'TUESDAY':
        return <Badge variant="purple">Tuesday</Badge>;
      case 'WEDNESDAY':
        return <Badge variant="warning">Wednesday</Badge>;
      case 'THURSDAY':
        return <Badge variant="success">Thursday</Badge>;
      case 'FRIDAY':
        return <Badge variant="danger">Friday</Badge>;
      default:
        return <Badge variant="default">{day}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl border border-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            ASMS Academic Source of Truth
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Class Timetable & Schedule</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Live synchronization with the institutional ASMS master schedule for BSc. Mechanical Engineering (ME Year 3).
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 p-2 rounded-xl border border-slate-700 text-xs">
          <Clock className="w-4 h-4 text-emerald-400" />
          <span>Configured Automated Reminder: <strong className="text-white">60 mins before class</strong></span>
        </div>
      </div>

      {/* Day filter tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500">
          <Filter className="w-3.5 h-3.5" /> Filter Day:
        </div>
        {days.map((d) => (
          <button
            key={d.id}
            onClick={() => setSelectedDay(d.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedDay === d.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Timetable List Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading master timetable entries...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          No classes scheduled for {selectedDay}.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tt) => {
            const subject = tt.classroom_subject?.subject;
            const lecturer = tt.classroom_subject?.lecturer;
            const isSending = sendingReminderId === tt.id;

            return (
              <div
                key={tt.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 hover:shadow-md transition-all p-5 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    {getDayBadge(tt.day_of_week)}
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {tt.type}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs font-bold text-indigo-600 flex items-center gap-1.5 mb-0.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      {subject?.code || 'ME 301'}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {subject?.name || 'Engineering Subject'}
                    </h3>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-800">
                        {tt.start_time} - {tt.end_time}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">{tt.venue}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="truncate">
                        {lecturer ? `${lecturer.title || ''} ${lecturer.first_name} ${lecturer.last_name}` : 'Course Lecturer'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Class: ME-Y3-2026</span>
                  <button
                    onClick={() => handleSendReminder(tt)}
                    disabled={isSending}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Send timetable email reminder to students"
                  >
                    <Send className="w-3 h-3" />
                    <span>{isSending ? 'Sending...' : 'Send Reminder'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
