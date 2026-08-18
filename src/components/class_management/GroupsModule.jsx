import React, { useState, useEffect } from 'react';
import { api } from '../../services/classManagementService.js';
import { GroupSet, Subject, StudentProfile } from '../types.js';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Users,
  PlusCircle,
  CheckCircle2,
  Sparkles,
  Shuffle,
  Scale,
  UserCheck,
  Send,
  BookOpen,
  Crown,
  Share2,
} from 'lucide-react';
import { Badge } from '../common/Badge.jsx';
import { Modal } from '../common/Modal.jsx';

export const GroupsModule = () => {
  const { user, isClassRep, studentProfile } = useAuth();
  const { showToast } = useNotifications();

  const [groupSets, setGroupSets] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [selectedGroupSet, setSelectedGroupSet] = useState(null);

  // Generation form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [numGroups, setNumGroups] = useState(4);
  const [allocationMethod, setAllocationMethod] = useState('BALANCED');
  const [generating, setGenerating] = useState(false);
  const [publishingId, setPublishingId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [groupsData, subs, studs] = await Promise.all([
        api.getGroups(),
        api.getSubjects(),
        api.getStudents(),
      ]);
      setGroupSets(groupsData);
      setSubjects(subs);
      setStudents(studs);
      if (subs.length > 0 && !subjectId) {
        setSubjectId(subs[0].id);
      }
      if (groupsData.length > 0) {
        setSelectedGroupSet(groupsData[0]);
      }
    } catch (err) {
      console.error('Failed to load group sets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !subjectId) {
      showToast('Validation Error', 'Title and Subject are required.', 'warning');
      return;
    }

    try {
      setGenerating(true);
      const created = await api.generateGroups({
        title,
        description,
        subject_id: subjectId,
        classroom_id: 'class-me-y3',
        num_groups: numGroups,
        allocation_method: allocationMethod,
      });

      setGroupSets((prev) => [created, ...prev]);
      setSelectedGroupSet(created);
      showToast(
        'Group Set Generated (DRAFT)',
        `Created ${numGroups} groups for review. Once verified, click "Publish Groups" to notify students.`,
        'success'
      );
      setGenerateModalOpen(false);
      setTitle('');
      setDescription('');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate groups';
      showToast('Error', errorMsg, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async (gs) => {
    try {
      setPublishingId(gs.id);
      const updated = await api.publishGroupSet(gs.id);
      setGroupSets((prev) => prev.map((item) => (item.id === gs.id ? updated : item)));
      if (selectedGroupSet?.id === gs.id) {
        setSelectedGroupSet(updated);
      }
      showToast(
        'Groups Officially Published',
        'In-app alerts and group roster emails have been sent to all allocated students.',
        'success'
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Publish failed';
      showToast('Error', errorMsg, 'error');
    } finally {
      setPublishingId(null);
    }
  };

  const canManage = user?.role === 'LECTURER' || user?.role === 'ADMIN' || isClassRep;

  // Student's own group in current group set
  const myGroup = selectedGroupSet?.groups.find((g) =>
    g.members.some((m) => m.student_id === studentProfile?.id)
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl border border-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            Subject Study Groups & Project Allocations
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Study Groups Management</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Create subject-specific project teams with random or balanced algorithmic distribution, draft review, and broadcast publishing.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setGenerateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-md transition-all self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Group Set</span>
          </button>
        )}
      </div>

      {/* Student "My Assigned Group" Highlight Card (If enrolled student) */}
      {user?.role === 'STUDENT' && myGroup && selectedGroupSet?.status === 'PUBLISHED' && (
        <div className="p-5 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-2xl border border-indigo-700/50 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
                <Users className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-indigo-300 font-bold">
                  Your Allocated Team
                </span>
                <h3 className="text-base font-bold text-white">{myGroup.name}</h3>
              </div>
            </div>
            <Badge variant="success">Published & Verified</Badge>
          </div>

          <p className="text-xs text-indigo-200 mb-4">{selectedGroupSet.title}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-3 border-t border-indigo-800/60">
            {myGroup.members.map((m, idx) => {
              const studentObj = students.find((s) => s.id === m.student_id);
              const isMe = m.student_id === studentProfile?.id;

              return (
                <div
                  key={m.id}
                  className={`p-3 rounded-xl border text-xs ${
                    isMe
                      ? 'bg-indigo-600/40 border-indigo-400 text-white font-bold'
                      : 'bg-slate-800/80 border-slate-700/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-indigo-300 font-mono">Member #{idx + 1}</span>
                    {m.role === 'LEADER' && (
                      <span className="flex items-center gap-1 text-[10px] text-amber-300 font-bold">
                        <Crown className="w-3 h-3" /> Lead
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-slate-100 truncate">
                    {studentObj?.user ? `${studentObj.user.first_name} ${studentObj.user.last_name}` : studentObj?.reg_number}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{studentObj?.reg_number}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Group Sets Selector Navigation */}
      {groupSets.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {groupSets.map((gs) => (
            <button
              key={gs.id}
              onClick={() => setSelectedGroupSet(gs)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border ${
                selectedGroupSet?.id === gs.id
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{gs.title}</span>
              {gs.status === 'DRAFT' && (
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-100 text-amber-800">Draft</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Selected Group Set Details & Roster */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading study groups...</div>
      ) : !selectedGroupSet ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          No group sets generated yet. Click "Create New Group Set" to get started.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Action / Status Bar */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-bold text-slate-900">{selectedGroupSet.title}</h3>
                <Badge variant={selectedGroupSet.status === 'PUBLISHED' ? 'success' : 'warning'}>
                  {selectedGroupSet.status === 'PUBLISHED' ? 'Published' : 'Draft (Review Mode)'}
                </Badge>
                <Badge variant="outline">Method: {selectedGroupSet.allocation_method}</Badge>
              </div>
              <p className="text-xs text-slate-600">{selectedGroupSet.description}</p>
            </div>

            {canManage && selectedGroupSet.status === 'DRAFT' && (
              <button
                onClick={() => handlePublish(selectedGroupSet)}
                disabled={publishingId === selectedGroupSet.id}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50 shrink-0"
              >
                <Share2 className="w-4 h-4" />
                <span>{publishingId === selectedGroupSet.id ? 'Publishing...' : 'Publish Groups to Students'}</span>
              </button>
            )}
          </div>

          {/* Groups Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedGroupSet.groups.map((group) => (
              <div
                key={group.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-100">
                        {group.group_number}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">{group.name}</h4>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {group.members.length} allocated members
                    </span>
                  </div>

                  <div className="space-y-2">
                    {group.members.map((member, idx) => {
                      const studentObj =
                        member.student || students.find((s) => s.id === member.student_id);
                      const isMe = member.student_id === studentProfile?.id;

                      return (
                        <div
                          key={member.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                            isMe
                              ? 'bg-indigo-50 border-indigo-200'
                              : 'bg-slate-50/60 border-slate-100 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-[11px] font-mono text-slate-400 w-4 text-right">
                              {idx + 1}.
                            </span>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 truncate">
                                {studentObj?.user
                                  ? `${studentObj.user.first_name} ${studentObj.user.last_name}`
                                  : studentObj?.reg_number}
                                {isMe && (
                                  <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded bg-indigo-600 text-white font-normal">
                                    You
                                  </span>
                                )}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                {studentObj?.reg_number}
                              </p>
                            </div>
                          </div>

                          {member.role === 'LEADER' ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              <Crown className="w-3 h-3 text-amber-500" /> Team Lead
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Member</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Group Set Modal */}
      <Modal
        isOpen={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        title="Generate Subject Study Groups"
        subtitle="Automatic distribution algorithm allocates enrolled students across teams"
      >
        <form onSubmit={handleGenerateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Subject / Course *</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Group Set Title *</label>
            <input
              type="text"
              placeholder="e.g. ME 305 CAD Machine Elements Design Project Groups"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white text-slate-800"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Number of Groups *</label>
              <input
                type="number"
                min={2}
                max={10}
                value={numGroups}
                onChange={(e) => setNumGroups(parseInt(e.target.value) || 4)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white text-slate-800"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">~{Math.ceil(20 / numGroups)} students per group</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Allocation Method *</label>
              <select
                value={allocationMethod}
                onChange={(e) => setAllocationMethod(e.target.value as 'BALANCED' | 'RANDOM' | 'MANUAL')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <option value="BALANCED">Balanced Allocation (Alphabetical/Sequential)</option>
                <option value="RANDOM">Random Shuffle Allocation</option>
                <option value="MANUAL">Manual Grouping</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Project Description & Deliverables</label>
            <textarea
              rows={3}
              placeholder="Specify the project scope, leader responsibilities, and presentation date..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white text-slate-800"
            />
          </div>

          <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 text-[11px] text-indigo-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p>
              Draft Protection groups will initially be in <strong>Draft Mode</strong> so you can review allocations. Students will only see their groups after you click "Publish".
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setGenerateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={generating}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Shuffle className="w-4 h-4" />
              <span>{generating ? 'Allocating...' : 'Generate Group Set'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
