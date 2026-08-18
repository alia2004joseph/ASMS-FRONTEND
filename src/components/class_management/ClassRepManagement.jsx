import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ClassRepresentativeAssignment, StudentProfile, Classroom, Subject } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Layers,
  GraduationCap,
  BookOpen,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const ClassRepManagement: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();

  const [representatives, setRepresentatives] = useState<ClassRepresentativeAssignment[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedClassroomId, setSelectedClassroomId] = useState('class-me-y3');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [isClassWide, setIsClassWide] = useState(true);

  // Granular permissions
  const [canUploadMaterials, setCanUploadMaterials] = useState(true);
  const [canDraftAnnouncements, setCanDraftAnnouncements] = useState(true);
  const [canHostAttendance, setCanHostAttendance] = useState(true);
  const [canGenerateGroups, setCanGenerateGroups] = useState(true);
  const [canCreatePolls, setCanCreatePolls] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reps, studs, classes, subs] = await Promise.all([
        api.getRepresentatives(),
        api.getStudents(),
        api.getClassrooms(),
        api.getSubjects(),
      ]);
      setRepresentatives(reps);
      setStudents(studs);
      setClassrooms(classes);
      setSubjects(subs);
      if (studs.length > 0) {
        setSelectedStudentId(studs[0].id);
      }
    } catch (err) {
      console.error('Failed to load class representatives data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedClassroomId) {
      showToast('Validation Error', 'Student and Classroom are required.', 'warning');
      return;
    }

    try {
      setAssigning(true);
      const created = await api.assignRepresentative({
        student_id: selectedStudentId,
        classroom_id: selectedClassroomId,
        subject_id: isClassWide ? null : selectedSubjectId || null,
        permissions: {
          can_upload_materials: canUploadMaterials,
          can_draft_announcements: canDraftAnnouncements,
          can_host_attendance: canHostAttendance,
          can_generate_groups: canGenerateGroups,
          can_create_polls: canCreatePolls,
        },
      });

      setRepresentatives((prev) => [created, ...prev]);
      showToast('Class Representative Appointed', 'Student permissions and leadership access have been granted.', 'success');
      setAssignModalOpen(false);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Assignment failed';
      showToast('Assignment Failed', errorMsg, 'error');
    } finally {
      setAssigning(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this Class Representative appointment?')) return;
    try {
      await api.revokeRepresentative(id);
      setRepresentatives((prev) => prev.filter((r) => r.id !== id));
      showToast('Appointment Revoked', 'The representative role has been deactivated.', 'info');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Revocation failed';
      showToast('Error', errorMsg, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl border border-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            ASMS Delegation & Governance
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Class Representatives Management</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Appoint verified student leaders with scoped permissions to manage class attendance, draft announcements, and coordinate study groups.
          </p>
        </div>

        <button
          onClick={() => setAssignModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-md transition-all self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Appoint Class Representative</span>
        </button>
      </div>

      {/* Reps Roster Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading appointed representatives...</div>
      ) : representatives.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          No class representatives appointed yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {representatives.map((rep) => {
            const studentObj = rep.student || students.find((s) => s.id === rep.student_id);
            const userObj = studentObj?.user;
            const classroomObj = rep.classroom || classrooms.find((c) => c.id === rep.classroom_id);
            const subjectObj = rep.subject || subjects.find((s) => s.id === rep.subject_id);

            return (
              <div
                key={rep.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs transition-all hover:border-indigo-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        {userObj?.first_name?.[0] || 'R'}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {userObj ? `${userObj.first_name} ${userObj.last_name}` : studentObj?.reg_number}
                        </h4>
                        <p className="text-xs text-slate-500 font-mono">{studentObj?.reg_number}</p>
                      </div>
                    </div>

                    <Badge variant={rep.is_active ? 'success' : 'default'} size="sm">
                      {rep.is_active ? 'Active Rep' : 'Inactive'}
                    </Badge>
                  </div>

                  {/* Scope Details */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-600 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5" /> Classroom:
                      </span>
                      <span className="font-semibold text-slate-800">{classroomObj?.name || 'ME Year 3'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" /> Representative Scope:
                      </span>
                      <span className="font-semibold text-indigo-700">
                        {subjectObj ? `Subject Rep (${subjectObj.code})` : 'Class-wide (General Class Rep)'}
                      </span>
                    </div>
                  </div>

                  {/* Permissions Pills */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Granted Permissions
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(rep.permissions || {}).map(([key, val]) => (
                        <span
                          key={key}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                            val
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-400 line-through'
                          }`}
                        >
                          {key.replace('can_', '').replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Appointed {new Date(rep.assigned_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleRevoke(rep.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Revoke Class Representative role"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assign Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Appoint New Class Representative"
        subtitle="Select an enrolled student and configure their governance privileges"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Enrolled Student *</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
              required
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.reg_number} — {s.user?.first_name} {s.user?.last_name} ({s.programme})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Classroom *</label>
              <select
                value={selectedClassroomId}
                onChange={(e) => setSelectedClassroomId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
              >
                {classrooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Scope</label>
              <select
                value={isClassWide ? 'CLASS' : 'SUBJECT'}
                onChange={(e) => setIsClassWide(e.target.value === 'CLASS')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <option value="CLASS">Class-wide (General Rep)</option>
                <option value="SUBJECT">Specific Subject Only</option>
              </select>
            </div>
          </div>

          {!isClassWide && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Subject *</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                required={!isClassWide}
              >
                <option value="">Select subject...</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Granular permissions checkboxes */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="block text-xs font-bold text-slate-700 mb-1">Configure Granted Permissions</span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={canUploadMaterials}
                  onChange={(e) => setCanUploadMaterials(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Upload Materials</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={canDraftAnnouncements}
                  onChange={(e) => setCanDraftAnnouncements(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Draft Announcements</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={canHostAttendance}
                  onChange={(e) => setCanHostAttendance(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Host Attendance Sessions</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={canGenerateGroups}
                  onChange={(e) => setCanGenerateGroups(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Generate Study Groups</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={canCreatePolls}
                  onChange={(e) => setCanCreatePolls(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Create Polls & Proposals</span>
              </label>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setAssignModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={assigning}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>{assigning ? 'Appointing...' : 'Confirm Appointment'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
