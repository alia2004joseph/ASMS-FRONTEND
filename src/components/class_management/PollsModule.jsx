import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Poll, Subject } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Vote,
  PlusCircle,
  CheckCircle2,
  Lock,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const PollsModule: React.FC = () => {
  const { user, isClassRep } = useAuth();
  const { showToast } = useNotifications();

  const [polls, setPolls] = useState<Poll[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [votingPollId, setVotingPollId] = useState<string | null>(null);

  // Create Poll Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pollType, setPollType] = useState<'VOTE' | 'PROPOSAL'>('PROPOSAL');
  const [subjectId, setSubjectId] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [proposalAction, setProposalAction] = useState('Reschedule Lecture / Lab Session');
  const [optionsText, setOptionsText] = useState('Option A: Friday 14:00 - 16:00\nOption B: Saturday 09:00 - 11:00\nOption C: Keep Original Slot');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pollsData, subs] = await Promise.all([api.getPolls(), api.getSubjects()]);
      setPolls(pollsData);
      setSubjects(subs);
      if (subs.length > 0 && !subjectId) {
        setSubjectId(subs[0].id);
      }
    } catch (err) {
      console.error('Failed to load polls:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId: string, optionId?: string, voteType?: string) => {
    try {
      setVotingPollId(pollId);
      const res = await api.votePoll(pollId, {
        option_id: optionId,
        vote_type: voteType,
      });

      setPolls((prev) => prev.map((p) => (p.id === pollId ? res.poll : p)));
      showToast('Vote Submitted', 'Your ballot has been securely counted.', 'success');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Voting failed';
      showToast('Vote Error', errorMsg, 'error');
    } finally {
      setVotingPollId(null);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Validation Error', 'Poll Title is required.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const options =
        pollType === 'VOTE'
          ? optionsText
              .split('\n')
              .map((o) => o.trim())
              .filter(Boolean)
          : undefined;

      const created = await api.createPoll({
        title,
        description,
        poll_type: pollType,
        classroom_id: 'class-me-y3',
        subject_id: subjectId || null,
        is_anonymous: isAnonymous,
        proposal_action: pollType === 'PROPOSAL' ? proposalAction : undefined,
        options,
      });

      setPolls((prev) => [created, ...prev]);
      showToast('Poll Published', 'Students can now cast their votes on this class initiative.', 'success');
      setCreateModalOpen(false);
      setTitle('');
      setDescription('');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create poll';
      showToast('Error', errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const canCreate = user?.role === 'LECTURER' || user?.role === 'ADMIN' || isClassRep;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl border border-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Vote className="w-4 h-4" />
            Class Representation & Democracy
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Polls & Class Proposals</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Empower student representation on class rescheduling, project deadlines, and academic feedback with anonymous ballots.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-md transition-all self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Poll or Proposal</span>
          </button>
        )}
      </div>

      {/* Polls List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading class polls...</div>
      ) : polls.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          No active polls right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {polls.map((poll) => {
            const hasVoted = poll.has_voted;
            const isVoting = votingPollId === poll.id;
            const totalVotes = poll.total_votes || 0;

            return (
              <div
                key={poll.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant={poll.poll_type === 'PROPOSAL' ? 'purple' : 'info'}>
                        {poll.poll_type === 'PROPOSAL' ? 'Class Proposal' : 'Choice Poll'}
                      </Badge>
                      {poll.is_anonymous && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          <Lock className="w-3 h-3 text-slate-400" /> Anonymous
                        </span>
                      )}
                    </div>
                    <Badge variant={poll.is_active ? 'success' : 'default'} size="sm">
                      {poll.is_active ? 'Active' : 'Closed'}
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug mb-1.5">{poll.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{poll.description}</p>

                  {/* Proposal Mode: YES / NO / ABSTAIN buttons */}
                  {poll.poll_type === 'PROPOSAL' && (
                    <div className="space-y-3 mb-4">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-700">Proposal Agreement</span>
                          <span className="text-[11px] text-slate-400">{totalVotes} total votes cast</span>
                        </div>

                        {/* Visual Breakdown Bar */}
                        <div className="w-full bg-slate-200 h-2.5 rounded-full flex overflow-hidden my-2">
                          <div
                            className="bg-emerald-500 h-full transition-all"
                            style={{
                              width: totalVotes ? `${((poll.proposal_stats?.yes || 0) / totalVotes) * 100}%` : '0%',
                            }}
                            title={`Agree: ${poll.proposal_stats?.yes || 0}`}
                          ></div>
                          <div
                            className="bg-rose-500 h-full transition-all"
                            style={{
                              width: totalVotes ? `${((poll.proposal_stats?.no || 0) / totalVotes) * 100}%` : '0%',
                            }}
                            title={`Disagree: ${poll.proposal_stats?.no || 0}`}
                          ></div>
                          <div
                            className="bg-slate-400 h-full transition-all"
                            style={{
                              width: totalVotes ? `${((poll.proposal_stats?.abstain || 0) / totalVotes) * 100}%` : '0%',
                            }}
                            title={`Abstain: ${poll.proposal_stats?.abstain || 0}`}
                          ></div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                          <span className="text-emerald-700 font-bold">
                            Agree: {poll.proposal_stats?.yes || 0} (
                            {totalVotes ? Math.round(((poll.proposal_stats?.yes || 0) / totalVotes) * 100) : 0}%)
                          </span>
                          <span className="text-rose-700 font-bold">
                            Disagree: {poll.proposal_stats?.no || 0} (
                            {totalVotes ? Math.round(((poll.proposal_stats?.no || 0) / totalVotes) * 100) : 0}%)
                          </span>
                          <span className="text-slate-500">Abstain: {poll.proposal_stats?.abstain || 0}</span>
                        </div>
                      </div>

                      {/* Vote Buttons if not voted */}
                      {!hasVoted ? (
                        <div className="grid grid-cols-3 gap-2 pt-2">
                          <button
                            onClick={() => handleVote(poll.id, undefined, 'YES')}
                            disabled={isVoting}
                            className="flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-xl border border-emerald-200 transition-all disabled:opacity-50"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" /> Agree
                          </button>
                          <button
                            onClick={() => handleVote(poll.id, undefined, 'NO')}
                            disabled={isVoting}
                            className="flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-xl border border-rose-200 transition-all disabled:opacity-50"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" /> Disagree
                          </button>
                          <button
                            onClick={() => handleVote(poll.id, undefined, 'ABSTAIN')}
                            disabled={isVoting}
                            className="flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-300 rounded-xl transition-all disabled:opacity-50"
                          >
                            Abstain
                          </button>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center justify-center gap-1.5 font-semibold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          You have voted on this proposal
                        </div>
                      )}
                    </div>
                  )}

                  {/* Multiple Option Vote Mode */}
                  {poll.poll_type === 'VOTE' && poll.options && (
                    <div className="space-y-2 mb-4">
                      {poll.options.map((opt) => {
                        const optVotes = opt.vote_count ?? opt.votes_count ?? 0;
                        const pct = totalVotes ? Math.round((optVotes / totalVotes) * 100) : 0;

                        return (
                          <div
                            key={opt.id}
                            onClick={() => !hasVoted && handleVote(poll.id, opt.id)}
                            className={`p-3 rounded-xl border transition-all ${
                              hasVoted
                                ? 'bg-slate-50 border-slate-200'
                                : 'bg-white hover:bg-indigo-50/50 hover:border-indigo-300 cursor-pointer'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="font-semibold text-slate-800">{opt.text}</span>
                              <span className="text-[11px] font-bold text-slate-500">
                                {optVotes} votes ({pct}%)
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}

                      {hasVoted && (
                        <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center justify-center gap-1.5 font-semibold mt-3">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Your vote is registered
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Created by {poll.created_by?.first_name} {poll.created_by?.last_name}</span>
                  <span className="flex items-center gap-1">
                    <BarChart3 className="w-3.5 h-3.5" /> {totalVotes} ballots counted
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Poll Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Class Poll or Proposal"
        subtitle="Gather student votes and democratic consensus on classroom decisions"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Poll Type *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPollType('PROPOSAL')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                  pollType === 'PROPOSAL'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Class Proposal (Agree / Disagree)
              </button>
              <button
                type="button"
                onClick={() => setPollType('VOTE')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                  pollType === 'VOTE'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Multiple Choice Poll
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Title / Question *</label>
            <input
              type="text"
              placeholder="e.g. Propose moving ME 301 Friday lecture from 14:00 to Saturday 09:00"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white text-slate-800"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Subject (Optional)</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value="">General Class Matter</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          {pollType === 'VOTE' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Vote Options (one per line) *</label>
              <textarea
                rows={4}
                value={optionsText}
                onChange={(e) => setOptionsText(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white text-slate-800"
                placeholder="Option 1&#10;Option 2&#10;Option 3"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Proposal Category</label>
              <select
                value={proposalAction}
                onChange={(e) => setProposalAction(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
              >
                <option value="Reschedule Lecture / Lab Session">Reschedule Lecture / Lab Session</option>
                <option value="Assignment / Project Due Date Extension">Assignment / Project Due Date Extension</option>
                <option value="Request Revision / Tutorial Session">Request Revision / Tutorial Session</option>
                <option value="Class Representative Initiative">Class Representative Initiative</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Context & Justification</label>
            <textarea
              rows={3}
              placeholder="Explain the background for this proposal to help students make an informed decision..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="anonCheckbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded-md border-slate-300"
            />
            <label htmlFor="anonCheckbox" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Anonymous Voting (Voter identity is cryptographically hashed for ballot privacy)
            </label>
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
              <Vote className="w-4 h-4" />
              <span>{submitting ? 'Creating...' : 'Publish Poll'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
