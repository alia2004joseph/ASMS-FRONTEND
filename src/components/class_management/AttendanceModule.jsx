import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { api } from '../../services/classManagementService.js';
import { AttendanceSession, Subject, StudentProfile } from '../types.js';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Clock,
  QrCode,
  CheckCircle2,
  Play,
  StopCircle,
  FileDown,
  UserCheck,
  KeyRound,
  Users,
  MapPin,
  Calendar,
  Sparkles,
  Maximize2,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';
import { Modal } from '../common/Modal.jsx';
import { generateAttendanceSheetPDF } from '../../utils/attendancePDFGenerator.js';

export const AttendanceModule = () => {
  const { user, isClassRep, studentProfile } = useAuth();
  const { showToast } = useNotifications();

  const [sessions, setSessions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [startModalOpen, setStartModalOpen] = useState(false);
  const [checkinModalOpen, setCheckinModalOpen] = useState(false);
  const [qrModalSession, setQrModalSession] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');

  // Start Session Form
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [topic, setTopic] = useState('');
  const [venue, setVenue] = useState('Lecture Theatre 3 (LT-3)');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [starting, setStarting] = useState(false);

  // Student Checkin Form
  const [sessionCodeInput, setSessionCodeInput] = useState('');
  const [submittingCheckin, setSubmittingCheckin] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sessionsData, subs, studs] = await Promise.all([
        api.getAttendanceSessions(),
        api.getSubjects(),
        api.getStudents(),
      ]);
      setSessions(sessionsData);
      setSubjects(subs);
      setStudents(studs);
      if (subs.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(subs[0].id);
      }
    } catch (err) {
      console.error('Failed to load attendance data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate QR image when session modal is opened
  useEffect(() => {
    if (qrModalSession) {
      const qrPayload = JSON.stringify({
        sessionId: qrModalSession.id,
        sessionCode: qrModalSession.session_code,
        qrToken: qrModalSession.qr_token,
        course: qrModalSession.classroom_subject?.subject?.code,
        timestamp.now(),
      });

      QRCode.toDataURL(qrPayload, { width: 320, margin: 2 })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR code generation error:', err));
    }
  }, [qrModalSession]);

  const handleStartSession = async (e) => {
    e.preventDefault();
    if (!selectedSubjectId || !topic.trim()) {
      showToast('Validation Error', 'Please select a subject and specify the class topic.', 'warning');
      return;
    }

    try {
      setStarting(true);
      const newSession = await api.startAttendanceSession({
        classroom_subject_id: 'cs-me301',
        topic,
        venue,
        duration_minutes: durationMinutes,
      });

      setSessions((prev) => [newSession, ...prev]);
      showToast(
        'Live Attendance Session Started',
        `Session Code: ${newSession.session_code}. Project QR code on screen for students.`,
        'success'
      );
      setStartModalOpen(false);
      setTopic('');
      setQrModalSession(newSession);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to start session';
      showToast('Error', errorMsg, 'error');
    } finally {
      setStarting(false);
    }
  };

  const handleCloseSession = async (session) => {
    try {
      const closed = await api.closeAttendanceSession(session.id);
      setSessions((prev) => prev.map((s) => (s.id === session.id ? closed : s)));
      showToast('Session Closed', `Attendance session ${session.session_code} is now closed.`, 'info');
      if (qrModalSession?.id === session.id) {
        setQrModalSession(null);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to close session';
      showToast('Error', errorMsg, 'error');
    }
  };

  const handleStudentCheckin = async (e) => {
    e.preventDefault();
    if (!sessionCodeInput.trim()) return;

    try {
      setSubmittingCheckin(true);
      const res = await api.markAttendance({
        session_code: sessionCodeInput.trim(),
        method: 'CODE',
      });
      showToast('Attendance Recorded', res.message, 'success');
      setCheckinModalOpen(false);
      setSessionCodeInput('');
      await loadData();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Check-in failed';
      showToast('Check-in Failed', errorMsg, 'error');
    } finally {
      setSubmittingCheckin(false);
    }
  };

  const handleDownloadPDF = (session) => {
    try {
      generateAttendanceSheetPDF(session, students);
      showToast('PDF Attendance Sheet Generated', 'Downloaded official signed attendance document.', 'success');
    } catch (err) {
      console.error('PDF error:', err);
      showToast('PDF Error', 'Failed to compile attendance document.', 'error');
    }
  };

  const canHostSession = user?.role === 'LECTURER' || user?.role === 'ADMIN' || isClassRep;
  const activeSession = sessions.find((s) => s.is_active);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl border border-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Clock className="w-4 h-4" />
            Live Classroom Attendance System
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Attendance & QR Check-in</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Real-time verified student check-in via QR code scanning or 6-digit session tokens with institutional PDF attendance sheet export.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {/* Student Check-in button */}
          {user?.role === 'STUDENT' && (
            <button
              onClick={() => setCheckinModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              <KeyRound className="w-4 h-4" />
              <span>Self Check-in (Enter Code)</span>
            </button>
          )}

          {/* Host Start Session */}
          {canHostSession && (
            <button
              onClick={() => setStartModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              <Play className="w-4 h-4" />
              <span>Launch Live Session</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Session Highlight Widget */}
      {activeSession && (
        <div className="p-5 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-900 text-white rounded-2xl border border-emerald-500/40 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                Live Active Attendance Session
              </span>
              <Badge variant="success" size="sm">
                Code: {activeSession.session_code}
              </Badge>
            </div>
            <h3 className="text-lg font-bold text-white">
              {activeSession.classroom_subject?.subject?.code}: {activeSession.topic}
            </h3>
            <p className="text-xs text-slate-300 flex items-center gap-4">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" /> {activeSession.venue}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-indigo-400" /> {activeSession.entries?.length || 0} students checked in
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setQrModalSession(activeSession)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition-colors"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Display Projector QR</span>
            </button>

            <button
              onClick={() => handleDownloadPDF(activeSession)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white text-xs font-bold rounded-xl border border-indigo-500/50 transition-colors"
            >
              <FileDown className="w-4 h-4" />
              <span>Export PDF Sheet</span>
            </button>

            {canHostSession && (
              <button
                onClick={() => handleCloseSession(activeSession)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white text-xs font-bold rounded-xl border border-rose-500/50 transition-colors"
              >
                <StopCircle className="w-4 h-4" />
                <span>Close Session</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Attendance Sessions History & Roster Feed */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600" />
          Attendance Sessions & Records ({sessions.length})
        </h3>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading attendance sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            No attendance sessions created yet.
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => {
              const enrolledCount = students.length || 20;
              const presentCount = session.entries?.length || 0;
              const rate = Math.round((presentCount / enrolledCount) * 100);

              // Check if current user is checked in
              const myEntry = session.entries?.find((e) => e.student_id === studentProfile?.id);

              return (
                <div
                  key={session.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs transition-all hover:border-slate-300"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                          {session.classroom_subject?.subject?.code || 'ME 301'}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{session.topic}</h4>
                        <Badge variant={session.is_active ? 'success' : 'default'}>
                          {session.is_active ? 'Active Session' : 'Closed Session'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-3">
                        <span>Date: {session.date}</span>
                        <span>Time: {session.start_time} - {session.end_time}</span>
                        <span>Venue: {session.venue}</span>
                        <span>Code: <strong className="font-mono text-slate-800">{session.session_code}</strong></span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {user?.role === 'STUDENT' && (
                        <div className="mr-2">
                          {myEntry ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              You Checked In ({myEntry.status})
                            </span>
                          ) : (
                            <span className="text-xs text-rose-600 font-semibold bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200">
                              Not Checked In
                            </span>
                          )}
                        </div>
                      )}

                      <button
                        onClick={() => setQrModalSession(session)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                      >
                        <QrCode className="w-3.5 h-3.5 text-slate-500" />
                        <span>QR Code</span>
                      </button>

                      <button
                        onClick={() => handleDownloadPDF(session)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl border border-indigo-200 transition-all"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>PDF Sheet</span>
                      </button>
                    </div>
                  </div>

                  {/* Attendance Roster Summary Bars */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-700">
                        Class Turnout: {presentCount} / {enrolledCount} Enrolled ({rate}%)
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        {enrolledCount - presentCount} Absent
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(rate, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Student Check-in Feed Preview */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Verified Check-in Feed ({session.entries?.length || 0})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {session.entries && session.entries.length > 0 ? (
                        session.entries.map((entry) => {
                          const student = entry.student || students.find((s) => s.id === entry.student_id);
                          return (
                            <span
                              key={entry.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
                            >
                              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <strong className="text-slate-900">
                                {student?.user ? `${student.user.first_name} ${student.user.last_name}` : student?.reg_number}
                              </strong>
                              <span className="text-[10px] text-slate-400 font-mono">
                                ({new Date(entry.marked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                              </span>
                            </span>
                          );
                        })
                      ) : (
                        <p className="text-xs text-slate-400 italic">No students checked in yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Start Session Modal */}
      <Modal
        isOpen={startModalOpen}
        onClose={() => setStartModalOpen(false)}
        title="Launch Live Attendance Session"
        subtitle="Generates real-time verification code and dynamically refreshing QR Code"
      >
        <form onSubmit={handleStartSession} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Course Subject *</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
              required
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Lecture Topic / Module *</label>
            <input
              type="text"
              placeholder="e.g. Advanced Thermodynamics Cycle Analysis"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white text-slate-800"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lecture Venue *</label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white text-slate-800"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Session Duration (mins) *</label>
              <input
                type="number"
                min={5}
                max={180}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 45)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white text-slate-800"
                required
              />
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              Automated Check-in launched, project the QR Code modal on the lecture theatre screen. Students scan or enter the 6-digit session token to authenticate.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setStartModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={starting}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Play className="w-4 h-4" />
              <span>{starting ? 'Starting...' : 'Launch Live Session'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Projector QR Code Display Modal */}
      <Modal
        isOpen={!!qrModalSession}
        onClose={() => setQrModalSession(null)}
        title="Classroom Attendance Projector QR"
        subtitle={`Session Code: ${qrModalSession?.session_code} • ${qrModalSession?.topic}`}
      >
        <div className="flex flex-col items-center justify-center p-4 text-center space-y-4">
          <div className="p-4 bg-white rounded-3xl shadow-xl border-4 border-indigo-600 flex flex-col items-center">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Attendance QR Code" className="w-64 h-64 object-contain rounded-xl" />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center bg-slate-100 text-slate-400">
                Generating QR...
              </div>
            )}

            <div className="mt-3 text-center">
              <span className="text-xs uppercase font-bold text-slate-400">Session Check-in Code</span>
              <p className="text-2xl font-black font-mono tracking-widest text-indigo-700">
                {qrModalSession?.session_code}
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 max-w-sm">
            Students scan the QR code above or enter the 6-digit session code into their ASMS student portal.
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => qrModalSession && handleDownloadPDF(qrModalSession)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl border border-indigo-200 transition-all"
            >
              <FileDown className="w-4 h-4" />
              <span>Download Official PDF Sheet</span>
            </button>
            <button
              onClick={() => setQrModalSession(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Close Display
            </button>
          </div>
        </div>
      </Modal>

      {/* Student Self Check-in Modal */}
      <Modal
        isOpen={checkinModalOpen}
        onClose={() => setCheckinModalOpen(false)}
        title="Student Attendance Self Check-in"
        subtitle="Enter the 6-digit session code displayed on the lecture theatre screen"
      >
        <form onSubmit={handleStudentCheckin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Session Code *</label>
            <input
              type="text"
              placeholder="e.g. ME301-8492"
              value={sessionCodeInput}
              onChange={(e) => setSessionCodeInput(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg font-mono font-bold tracking-widest focus:bg-white text-indigo-700"
              required
            />
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed text-center">
            Your attendance will be verified and recorded for <strong>{studentProfile?.reg_number}</strong>.
          </p>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setCheckinModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingCheckin}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submittingCheckin ? 'Verifying...' : 'Confirm Attendance'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
