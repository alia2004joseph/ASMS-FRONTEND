import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { api } from '../../services/api';
import {
  TimetableEntry,
  Announcement,
  Material,
  AttendanceSession,
  Poll,
  StudentFeedback,
} from '../../types';
import {
  GraduationCap,
  Calendar,
  Clock,
  BookOpen,
  Megaphone,
  Users,
  Vote,
  MessageSquare,
  QrCode,
  ArrowRight,
  Send,
  Sparkles,
  AlertTriangle,
  Play,
  CheckCircle2,
  FileDown,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { NavTab } from '../layout/Sidebar';
import { generateAttendanceSheetPDF } from '../common/PDFGenerator';

interface OverviewDashboardProps {
  onNavigate: (tab: NavTab) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ onNavigate }) => {
  const { user, isClassRep, studentProfile } = useAuth();
  const { showToast } = useNotifications();

  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [feedbackList, setFeedbackList] = useState<StudentFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllStats();
  }, []);

  const loadAllStats = async () => {
    try {
      setLoading(true);
      const [tt, anns, mats, attSessions, pls, fbs] = await Promise.all([
        api.getTimetable(),
        api.getAnnouncements(),
        api.getMaterials(),
        api.getAttendanceSessions(),
        api.getPolls(),
        api.getFeedback(),
      ]);
      setTimetable(tt);
      setAnnouncements(anns);
      setMaterials(mats);
      setSessions(attSessions);
      setPolls(pls);
      setFeedbackList(fbs);
    } catch (err) {
      console.error('Failed to load dashboard overview data:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeAttendance = sessions.find((s) => s.is_active);
  const pendingAnnouncements = announcements.filter((a) => a.status === 'PENDING_REVIEW');
  const nextClass = timetable[0]; // Next scheduled class

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {user?.role === 'STUDENT'
                  ? isClassRep
                    ? 'Class Representative Mode'
                    : 'Enrolled Student Portal'
                  : user?.role === 'LECTURER'
                  ? 'Course Lecturer Portal'
                  : 'ASMS Administrator Console'}
              </span>
              <span className="text-xs text-slate-400">• Class: ME-Y3-2026</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, {user?.title ? `${user.title} ` : ''}
              {user?.first_name} {user?.last_name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {user?.role === 'STUDENT' && !isClassRep && (
                <>
                  Access your course timetable, verified attendance QR check-in, subject materials, and cast your vote on class proposals.
                </>
              )}
              {isClassRep && (
                <>
                  You are the appointed Class Representative for BSc. Mechanical Engineering. You can host attendance sessions, upload course notes, draft announcements, and coordinate study groups.
                </>
              )}
              {user?.role === 'LECTURER' && (
                <>
                  Review class representative drafts, publish lecture materials, inspect attendance records, and triage student feedback for your engineering courses.
                </>
              )}
              {user?.role === 'ADMIN' && (
                <>
                  Manage class representative appointments across academic departments, monitor audit logs, and oversee curriculum data integration.
                </>
              )}
            </p>
          </div>

          {/* Quick Action Buttons on Hero */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigate('AI_ASSISTANT')}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all border border-indigo-400/30"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Ask Class AI</span>
            </button>

            {activeAttendance ? (
              <button
                onClick={() => onNavigate('ATTENDANCE')}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition-all animate-pulse"
              >
                <QrCode className="w-4 h-4" />
                <span>Live Attendance Active ({activeAttendance.session_code})</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('ATTENDANCE')}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                <Clock className="w-4 h-4" />
                <span>Check Attendance</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('TIMETABLE')}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all"
            >
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>View Timetable</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lecturer Pending Review Callout */}
      {(user?.role === 'LECTURER' || user?.role === 'ADMIN') && pendingAnnouncements.length > 0 && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-800 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                Action Required: {pendingAnnouncements.length} Class Rep Announcement(s) Awaiting Review
              </h4>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Class representative drafts require lecturer approval before broadcasting via email to all students.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('ANNOUNCEMENTS')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
          >
            Review Now
          </button>
        </div>
      )}

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Timetable / Classes */}
        <div
          onClick={() => onNavigate('TIMETABLE')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Calendar className="w-5 h-5" />
            </span>
            <span className="text-xs text-indigo-600 font-bold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              View <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900">{timetable.length}</p>
          <p className="text-xs font-semibold text-slate-600 mt-0.5">Scheduled Classes</p>
          <p className="text-[10px] text-slate-400 mt-1">BSc. Mechanical Eng. (Year 3)</p>
        </div>

        {/* Card 2: Materials Repository */}
        <div
          onClick={() => onNavigate('MATERIALS')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <BookOpen className="w-5 h-5" />
            </span>
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              Access <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900">{materials.length}</p>
          <p className="text-xs font-semibold text-slate-600 mt-0.5">Course Materials</p>
          <p className="text-[10px] text-slate-400 mt-1">Protected PDF & notes repo</p>
        </div>

        {/* Card 3: Announcements */}
        <div
          onClick={() => onNavigate('ANNOUNCEMENTS')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 rounded-xl bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <Megaphone className="w-5 h-5" />
            </span>
            <span className="text-xs text-sky-600 font-bold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              Read <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900">{announcements.length}</p>
          <p className="text-xs font-semibold text-slate-600 mt-0.5">Class Notices</p>
          <p className="text-[10px] text-slate-400 mt-1">
            {pendingAnnouncements.length > 0 ? `${pendingAnnouncements.length} pending review` : 'All notices active'}
          </p>
        </div>

        {/* Card 4: Democracy & Polls */}
        <div
          onClick={() => onNavigate('POLLS')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Vote className="w-5 h-5" />
            </span>
            <span className="text-xs text-purple-600 font-bold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              Vote <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900">{polls.length}</p>
          <p className="text-xs font-semibold text-slate-600 mt-0.5">Active Class Polls</p>
          <p className="text-[10px] text-slate-400 mt-1">Anonymous voting enabled</p>
        </div>
      </div>

      {/* Main Content Split: Next Class & Latest Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Schedule & Today's classes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Next Scheduled Lecture & Timetable
            </h3>
            <button
              onClick={() => onNavigate('TIMETABLE')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Full Schedule <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {nextClass && (
            <div className="p-5 bg-white rounded-2xl border border-indigo-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="info">Upcoming Class</Badge>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {nextClass.day_of_week} • {nextClass.start_time} - {nextClass.end_time}
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900">
                  {nextClass.classroom_subject?.subject?.code}: {nextClass.classroom_subject?.subject?.name}
                </h4>
                <p className="text-xs text-slate-600">
                  Venue: <strong>{nextClass.venue}</strong> • Lecturer:{' '}
                  {nextClass.classroom_subject?.lecturer
                    ? `${nextClass.classroom_subject.lecturer.first_name} ${nextClass.classroom_subject.lecturer.last_name}`
                    : 'Faculty Staff'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('ATTENDANCE')}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                >
                  Go to Attendance
                </button>
              </div>
            </div>
          )}

          {/* Quick Module Shortcut Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              onClick={() => onNavigate('GROUPS')}
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                <Users className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Study Groups
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Project teams & allocations</p>
            </button>

            <button
              onClick={() => onNavigate('FEEDBACK')}
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Student Feedback
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Academic grievance triage</p>
            </button>

            <button
              onClick={() => onNavigate('MATERIALS')}
              className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                <BookOpen className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Lecture Notes
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Download syllabus & slides</p>
            </button>
          </div>
        </div>

        {/* Right 1 Col: Latest Broadcast Announcements Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-sky-600" />
              Latest Announcements
            </h3>
            <button
              onClick={() => onNavigate('ANNOUNCEMENTS')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-800"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {announcements.slice(0, 3).map((ann) => (
              <div
                key={ann.id}
                onClick={() => onNavigate('ANNOUNCEMENTS')}
                className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-xs transition-all cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <Badge variant={ann.priority === 'URGENT' ? 'danger' : 'default'} size="sm">
                    {ann.priority}
                  </Badge>
                  <span className="text-[10px] text-slate-400">
                    {new Date(ann.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">{ann.title}</h4>
                <p className="text-[11px] text-slate-600 line-clamp-2">{ann.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
