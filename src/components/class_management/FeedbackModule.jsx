import React, { useState, useEffect } from 'react';
import { api } from '../../services/classManagementService.js';
import { StudentFeedback, Subject } from '../types.js';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  MessageSquare,
  PlusCircle,
  ShieldCheck,
  Lock,
  User,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  Loader2,
  FileText,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';
import { Modal } from '../common/Modal.jsx';

export const FeedbackModule = () => {
  const { user, isClassRep } = useAuth();
  const { showToast } = useNotifications();

  const [feedbackList, setFeedbackList] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [summarizing, setSummarizing] = useState(false);
  const [respondFeedback, setRespondFeedback] = useState(null);
  const [responseStatus, setResponseStatus] = useState('RESOLVED');
  const [adminResponseText, setAdminResponseText] = useState('');
  const [updating, setUpdating] = useState(false);

  // Submit Feedback Form
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('ACADEMIC');
  const [subjectId, setSubjectId] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleAiSummarize = async () => {
    try {
      setSummarizing(true);
      const res = await api.aiSummarizeFeedback();
      setAiSummary(res.summary);
      setSummaryModalOpen(true);
    } catch (err) {
      console.error('AI summary error:', err);
      showToast('AI Summary Failed', 'Could not generate feedback briefing.', 'error');
    } finally {
      setSummarizing(false);
    }
  };


  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [feedbacks, subs] = await Promise.all([api.getFeedback(), api.getSubjects()]);
      setFeedbackList(feedbacks);
      setSubjects(subs);
      if (subs.length > 0 && !subjectId) {
        setSubjectId(subs[0].id);
      }
    } catch (err) {
      console.error('Failed to load feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      showToast('Validation Error', 'Title and Message are required.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const created = await api.submitFeedback({
        title,
        message,
        category,
        classroom_id: 'class-me-y3',
        subject_id: subjectId || null,
        is_anonymous: isAnonymous,
      });

      setFeedbackList((prev) => [created, ...prev]);
      showToast('Feedback Submitted', 'Your feedback has been routed to class representatives and lecturers.', 'success');
      setSubmitModalOpen(false);
      setTitle('');
      setMessage('');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to submit feedback';
      showToast('Error', errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!respondFeedback) return;

    try {
      setUpdating(true);
      const updated = await api.updateFeedbackStatus(respondFeedback.id, {
        status: responseStatus,
        admin_response: adminResponseText.trim() || undefined,
      });

      setFeedbackList((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      showToast('Feedback Updated', 'Status and response have been recorded.', 'success');
      setRespondFeedback(null);
      setAdminResponseText('');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Update failed';
      showToast('Error', errorMsg, 'error');
    } finally {
      setUpdating(false);
    }
  };

  const canTriage = user?.role === 'LECTURER' || user?.role === 'ADMIN' || isClassRep;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUBMITTED':
        return <Badge variant="warning">Submitted</Badge>;
      case 'UNDER_REVIEW':
        return <Badge variant="info">Under Review</Badge>;
      case 'RESOLVED':
        return <Badge variant="success">Resolved</Badge>;
      case 'DISMISSED':
        return <Badge variant="default">Dismissed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'ACADEMIC':
        return <Badge variant="purple">Academic / Teaching</Badge>;
      case 'FACILITIES':
        return <Badge variant="warning">Lab & Facilities</Badge>;
      case 'TIMETABLE':
        return <Badge variant="info">Timetable Clash</Badge>;
      case 'ADMINISTRATIVE':
        return <Badge variant="default">Administrative</Badge>;
      default:
        return <Badge>{cat}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl border border-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <MessageSquare className="w-4 h-4" />
            Class Feedback & Continuous Improvement
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Student Feedback & Grievance Channel</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Direct communication channel for students with anonymous privacy support, lecturer triage, and resolution tracking.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          {(user?.role === 'LECTURER' || user?.role === 'ADMIN' || isClassRep) && (
            <button
              onClick={handleAiSummarize}
              disabled={summarizing}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {summarizing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-300" />
              )}
              <span>{summarizing ? 'Analyzing Feedback...' : 'AI Grievance Insights'}</span>
            </button>
          )}

          <button
            onClick={() => setSubmitModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-md transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit Student Feedback</span>
          </button>
        </div>
      </div>

      {/* Feedback List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading feedback entries...</div>
      ) : feedbackList.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          No feedback tickets submitted yet.
        </div>
      ) : (
        <div className="space-y-4">
          {feedbackList.map((item) => {
            const subject = item.subject || subjects.find((s) => s.id === item.subject_id);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs transition-all hover:border-indigo-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(item.status)}
                    {getCategoryBadge(item.category)}
                    {subject && (
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        {subject.code}
                      </span>
                    )}
                    {item.is_anonymous ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        <Lock className="w-3 h-3 text-slate-400" /> Anonymous Submission
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full font-semibold">
                        <User className="w-3 h-3 text-slate-400" />
                        {item.student?.user
                          ? `${item.student.user.first_name} ${item.student.user.last_name}`
                          : item.student?.reg_number}
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3 whitespace-pre-line">
                  {item.message}
                </p>

                {/* Resolution / Admin Response Banner */}
                {item.admin_response && (
                  <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-100 text-xs text-indigo-900 mb-3 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-800">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Official Lecturer / Representative Response:
                    </div>
                    <p className="leading-relaxed text-indigo-950 font-medium">{item.admin_response}</p>
                  </div>
                )}

                {/* Triage / Update trigger for staff/reps */}
                {canTriage && (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Class-Y3-2026</span>
                    <button
                      onClick={() => {
                        setRespondFeedback(item);
                        setResponseStatus(item.status);
                        setAdminResponseText(item.admin_response || '');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl border border-indigo-200 transition-all"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Respond & Triage Status</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Submit Feedback Modal */}
      <Modal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        title="Submit Student Feedback or Grievance"
        subtitle="Your feedback is shared directly with the Class Representative and Department Lecturers"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Feedback Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value['category'])}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value="ACADEMIC">Teaching Quality & Course Content</option>
              <option value="FACILITIES">Laboratory Equipment & Classroom Facilities</option>
              <option value="TIMETABLE">Timetable Schedule & Overlaps</option>
              <option value="ADMINISTRATIVE">Department Administration & Assessments</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Related Subject (Optional)</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value="">General / Class-wide</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Feedback Title *</label>
            <input
              type="text"
              placeholder="e.g. Lab 2 Vibration sensors calibration issue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white text-slate-800"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Feedback Details *</label>
            <textarea
              rows={4}
              placeholder="Describe your suggestion or grievance with specific context to help the department act swiftly..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white text-slate-800"
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="feedbackAnon"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded-md border-slate-300"
            />
            <label htmlFor="feedbackAnon" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Submit Anonymously (Hide your name and registration number)
            </label>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setSubmitModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Submit Feedback'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Triage / Respond Modal */}
      <Modal
        isOpen={!!respondFeedback}
        onClose={() => setRespondFeedback(null)}
        title="Triage Student Feedback"
        subtitle={`Ticket: "${respondFeedback?.title}"`}
      >
        <form onSubmit={handleStatusUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Update Status *</label>
            <select
              value={responseStatus}
              onChange={(e) => setResponseStatus(e.target.value['status'])}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value="UNDER_REVIEW">Under Review (Acknowledged)</option>
              <option value="RESOLVED">Resolved</option>
              <option value="DISMISSED">Dismissed / Inapplicable</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Official Response / Action Taken</label>
            <textarea
              rows={3}
              placeholder="e.g. Lab technicians have recalibrated the accelerometer kits in Mechanics Lab 2. Thank you for flagging..."
              value={adminResponseText}
              onChange={(e) => setAdminResponseText(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white text-slate-800"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setRespondFeedback(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {updating ? 'Saving...' : 'Save & Publish Response'}
            </button>
          </div>
        </form>
      </Modal>

      {/* AI Summary & Grievance Insights Modal */}
      <Modal
        isOpen={summaryModalOpen}
        onClose={() => setSummaryModalOpen(false)}
        title="AI Grievance & Feedback Executive Summary"
        subtitle="Institutional analysis of all recorded student feedback and department trends"
      >
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-indigo-100 flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-indigo-950">Gemini 3.7 Academic Quality Analysis</h4>
              <p className="text-[11px] text-indigo-700">
                Synthesized across all submitted student categories including Lab Facilities, Timetables, and Coursework.
              </p>
            </div>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-800 whitespace-pre-line leading-relaxed max-h-[350px] overflow-y-auto">
            {aiSummary || 'No summary generated.'}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setSummaryModalOpen(false)}
              className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors shadow-xs"
            >
              Done / Close Briefing
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
