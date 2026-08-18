import React, { useState, useEffect } from 'react';
import { api } from '../../services/classManagementService.js';
import { AuditLog, EmailLog } from '../types.js';
import { History, Mail, Filter, Search, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export const AuditLogsView = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('AUDIT');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [audits, emails] = await Promise.all([api.getAuditLogs(), api.getEmailLogs()]);
      setAuditLogs(audits);
      setEmailLogs(emails);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAudits = auditLogs.filter(
    (a) =>
      a.action.toLowerCase().includes(search.toLowerCase()) ||
      a.user_name.toLowerCase().includes(search.toLowerCase()) ||
      a.entity.toLowerCase().includes(search.toLowerCase())
  );

  const filteredEmails = emailLogs.filter(
    (e) =>
      e.recipient_email.toLowerCase().includes(search.toLowerCase()) ||
      e.subject.toLowerCase().includes(search.toLowerCase()) ||
      e.recipient_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl border border-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            Security Compliance & Traceability
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">System Audit Trail & Email Center</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Immutable activity log recording all representative actions, announcement broadcasts, attendance sessions, and email dispatches.
          </p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'AUDIT'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('EMAILS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'EMAILS'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Dispatched Emails ({emailLogs.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white text-slate-800"
          />
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading log records...</div>
      ) : activeTab === 'AUDIT' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Entity</th>
                  <th className="p-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredAudits.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-3.5 whitespace-nowrap font-bold text-slate-900">
                      {log.user_name}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-slate-600 font-mono">
                      {log.entity}
                    </td>
                    <td className="p-3.5 text-slate-500 max-w-xs truncate font-mono text-[11px]">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEmails.map((email) => (
            <div
              key={email.id}
              className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-indigo-600" />
                    To: {email.recipient_name} ({email.recipient_email})
                  </span>
                  <Badge variant="success" size="sm">
                    {email.status}
                  </Badge>
                </div>
                <span className="text-[11px] text-slate-400">
                  {new Date(email.sent_at).toLocaleString()}
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-800">{email.subject}</h4>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-mono text-slate-600 whitespace-pre-line leading-relaxed">
                {email.body_preview}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
