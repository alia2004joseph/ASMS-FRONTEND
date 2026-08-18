import React, { useState, useEffect } from 'react';
import { api } from '../../services/classManagementService.js';
import { Announcement, Subject } from '../types.js';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Megaphone,
  PlusCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  User,
  ShieldCheck,
  Tag,
  Paperclip,
  CheckCheck,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';
import { Modal } from '../common/Modal.jsx';

export const AnnouncementsModule = () => {
  const { user, isClassRep } = useAuth();
  const { showToast } = useNotifications();

  const [announcements, setAnnouncements] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRejectAnn, setSelectedRejectAnn] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Create form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [subjectId, setSubjectId] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [aiDrafting, setAiDrafting] = useState(false);

  const handleAiDraft = async () => {
    if (!content.trim() && !title.trim()) {
      showToast('AI Draft', 'Type some rough notes into content or title first, and Gemini will format it.', 'info');
      return;
    }

    try {
      setAiDrafting(true);
      const selectedSub = subjects.find((s) => s.id === subjectId);
      const result = await api.aiDraftAnnouncement({
        raw_notes: content || title,
        subject_code: selectedSub?.code || 'General',
        urgency: priority,
      });

      if (result.title) setTitle(result.title);
      if (result.content) setContent(result.content);
      showToast('AI Formatted Draft', 'Gemini structured your notes into a formal academic announcement.', 'success');
    } catch (err) {
      console.error('AI Draft failed:', err);
      showToast('AI Drafting Failed', 'Could not reach AI drafting service.', 'error');
    } finally {
      setAiDrafting(false);
    }
  };


  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [anns, subs] = await Promise.all([api.getAnnouncements(), api.getSubjects()]);
      setAnnouncements(anns);
      setSubjects(subs);
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast('Validation Error', 'Title and Content are required.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const created = await api.createAnnouncement({
        title,
        content,
        priority,
        target_type: subjectId ? 'SUBJECT' : 'CLASS',
        classroom_id: 'class-me-y3',
        subject_id: subjectId || null,
        attachment_name: attachmentName.trim() || undefined,
      });

      setAnnouncements((prev) => [created, ...prev]);

      if (created.status === 'PUBLISHED') {
        showToast('Announcement Published', 'Broadcasted immediately to all students via email and in-app alert.', 'success');
      } else {
        showToast('Draft Submitted for Lecturer Approval', 'Class Rep announcements require course lecturer or admin review before broadcasting.', 'info');
      }

      setCreateModalOpen(false);
      setTitle('');
      setContent('');
      setAttachmentName('');
      setSubjectId('');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to submit announcement';
      showToast('Error', errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (ann) => {
    try {
      const updated = await api.reviewAnnouncement(ann.id, 'APPROVE');
      setAnnouncements((prev) => prev.map((a) => (a.id === ann.id ? updated : a)));
      showToast('Announcement Approved & Published', `"${ann.title}" is now published. Students have been notified.`, 'success');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Approval failed';
      showToast('Approval Failed', errorMsg, 'error');
    }
  };

  const handleRejectClick = (ann) => {
    setSelectedRejectAnn(ann);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRejectAnn || !rejectionReason.trim()) return;

    try {
      const updated = await api.reviewAnnouncement(selectedRejectAnn.id, 'REJECT', rejectionReason);
      setAnnouncements((prev) => prev.map((a) => (a.id === selectedRejectAnn.id ? updated : a)));
      showToast('Announcement Rejected', 'The representative has been notified with the provided reason.', 'info');
      setRejectModalOpen(false);
      setSelectedRejectAnn(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Rejection failed';
      showToast('Error', errorMsg, 'error');
    }
  };

  const isLecturerOrAdmin = user?.role === 'LECTURER' || user?.role === 'ADMIN';
  const pendingCount = announcements.filter((a) => a.status === 'PENDING_REVIEW').length;

  const filtered = announcements.filter((a) => {
    if (selectedFilter === 'ALL') return true;
    return a.status === selectedFilter;
  });

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'URGENT':
        return <Badge variant="danger">URGENT ALERT</Badge>;
      case 'IMPORTANT':
        return <Badge variant="warning">Important</Badge>;
      default:
        return <Badge variant="default">General Notice</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return <Badge variant="success">Published</Badge>;
      case 'PENDING_REVIEW':
        return <Badge variant="warning">Pending Lecturer Approval</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">Rejected</Badge>;
      case 'DRAFT':
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl border border-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Megaphone className="w-4 h-4" />
            Class Communications & Notice Board
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Announcements & Approvals</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Controlled broadcasting workflow with mandatory lecturer review for representative drafts and automated student email delivery.
          </p>
        </div>

        {(user?.role === 'STUDENT' ? isClassRep : true) && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-md transition-all self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isClassRep && user?.role === 'STUDENT' ? 'Draft Announcement' : 'Publish Announcement'}</span>
          </button>
        )}
      </div>

      {/* Lecturer Pending Review Alert Callout */}
      {isLecturerOrAdmin && pendingCount > 0 && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-800 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                Action Required: {pendingCount} Class Representative Announcement(s) Pending Review
              </h4>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Review representative submissions below. Approved announcements are immediately emailed to all enrolled students.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedFilter('PENDING_REVIEW')}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs shrink-0 transition-colors"
          >
            Filter Pending ({pendingCount})
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={() => setSelectedFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Announcements ({announcements.length})
        </button>

        <button
          onClick={() => setSelectedFilter('PUBLISHED')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedFilter === 'PUBLISHED' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Published ({announcements.filter((a) => a.status === 'PUBLISHED').length})
        </button>

        {(isLecturerOrAdmin || isClassRep) && (
          <>
            <button
              onClick={() => setSelectedFilter('PENDING_REVIEW')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedFilter === 'PENDING_REVIEW' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Pending Approval ({pendingCount})
            </button>

            <button
              onClick={() => setSelectedFilter('REJECTED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedFilter === 'REJECTED' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Rejected ({announcements.filter((a) => a.status === 'REJECTED').length})
            </button>
          </>
        )}
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading announcements...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          No announcements found in this view.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((ann) => {
            const subject = ann.subject || subjects.find((s) => s.id === ann.subject_id);

            return (
              <div
                key={ann.id}
                className={`bg-white rounded-2xl border p-5 transition-all shadow-xs ${
                  ann.status === 'PENDING_REVIEW'
                    ? 'border-amber-300 bg-amber-50/20'
                    : ann.priority === 'URGENT'
                    ? 'border-rose-300 ring-1 ring-rose-200'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {getPriorityBadge(ann.priority)}
                    {getStatusBadge(ann.status)}
                    {subject && (
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {subject.code}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(ann.created_at).toLocaleString()}
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2">{ann.title}</h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line mb-4">
                  {ann.content}
                </p>

                {ann.attachment_name && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-mono text-slate-700 border border-slate-200 mb-4">
                    <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                    <span>Attachment: {ann.attachment_name}</span>
                  </div>
                )}

                {/* Rejection Note Banner if rejected */}
                {ann.status === 'REJECTED' && ann.rejection_reason && (
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800 mb-4">
                    <strong>Rejection Reason from Lecturer:</strong> {ann.rejection_reason}
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Posted by{' '}
                      <strong>
                        {ann.created_by ? `${ann.created_by.first_name} ${ann.created_by.last_name}` : 'Staff'}
                      </strong>
                    </span>
                    {ann.reviewed_by && (
                      <span className="text-[11px] text-slate-400 ml-2">
                        • Reviewed by {ann.reviewed_by.first_name} {ann.reviewed_by.last_name}
                      </span>
                    )}
                  </div>

                  {/* Lecturer Action Buttons for Pending Items */}
                  {isLecturerOrAdmin && ann.status === 'PENDING_REVIEW' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRejectClick(ann)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject with Reason
                      </button>
                      <button
                        onClick={() => handleApprove(ann)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Approve & Broadcast
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Announcement Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={isClassRep && user?.role === 'STUDENT' ? 'Draft Class Announcement' : 'Publish Announcement'}
        subtitle={
          isClassRep && user?.role === 'STUDENT'
            ? 'Workflow Policy announcements are submitted to the course lecturer for review before broadcasting.'
            : 'Immediate broadcast in-app alert and institutional email will be dispatched to enrolled students.'
        }
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Announcement Title *</label>
            <input
              type="text"
              placeholder="e.g. Schedule Revision Mechanics Lab Group Shifts"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white text-slate-800"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Subject (Optional)</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <option value="">Entire Class (All Subjects)</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Broadcast Priority *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value['priority'])}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <option value="NORMAL">Normal / General Notice</option>
                <option value="IMPORTANT">Important</option>
                <option value="URGENT">Urgent Broadcast</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">Announcement Content *</label>
              <button
                type="button"
                onClick={handleAiDraft}
                disabled={aiDrafting}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold transition-all disabled:opacity-50"
              >
                {aiDrafting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span>{aiDrafting ? 'Gemini is drafting...' : 'AI Enhance & Format Draft'}</span>
              </button>
            </div>
            <textarea
              rows={4}
              placeholder="Write your announcement or type rough bullet points and click 'AI Enhance & Format Draft'..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white text-slate-800"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Simulated Attachment Name (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Revised_Lab_Schedule_2026.pdf"
              value={attachmentName}
              onChange={(e) => setAttachmentName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Megaphone className="w-4 h-4" />
              <span>
                {submitting
                  ? 'Submitting...'
                  : isClassRep && user?.role === 'STUDENT'
                  ? 'Submit for Lecturer Review'
                  : 'Publish & Broadcast'}
              </span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Reject Announcement Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Announcement Submission"
        subtitle="Please provide a clear reason to guide the Class Representative"
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4">
          <p className="text-xs text-slate-600">
            You are rejecting announcement: <strong>"{selectedRejectAnn?.title}"</strong>
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Rejection Reason *</label>
            <textarea
              rows={3}
              placeholder="e.g. Please clarify that Lab Group B should bring printed data sheets rather than soft copies..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white text-slate-800"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setRejectModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              <span>Confirm Rejection</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
