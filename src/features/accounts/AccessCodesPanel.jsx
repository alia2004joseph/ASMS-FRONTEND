import React, { useCallback, useEffect, useState } from "react";
import { Copy, Plus, RefreshCcw, Check } from "lucide-react";
import {
  listAccessCodes,
  createAccessCode,
  updateAccessCode,
} from "../../api/accountsApi.js";
import { useAuth } from "../../hooks/useAuth.js";
import LoadingState from "../../components/common/LoadingState.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import { useToast } from "../../components/ui/ToastProvider.jsx";

// School admins may only issue codes for these roles (backend-enforced —
// AccessCodeSerializer.validate_role rejects anything else for non-superusers).
const ADMIN_ISSUABLE_ROLES = ["student", "guardian", "teacher"];
const SUPERUSER_ISSUABLE_ROLES = ["student", "guardian", "teacher", "accountant", "admin"];

const ROLE_LABEL = {
  admin: "Admin",
  teacher: "Teacher",
  student: "Student",
  guardian: "Guardian",
  accountant: "Accountant",
};

function formatDate(iso) {
  if (!iso) return "No expiry";
  return new Date(iso).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AccessCodesPanel() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isSuperuser = user?.role === "super_admin";
  const issuableRoles = isSuperuser ? SUPERUSER_ISSUABLE_ROLES : ADMIN_ISSUABLE_ROLES;

  const [codes, setCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formRole, setFormRole] = useState(issuableRoles[0]);
  const [formMaxUses, setFormMaxUses] = useState(1);
  const [formExpiresAt, setFormExpiresAt] = useState("");
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCodes = useCallback(() => {
    setIsLoading(true);
    setError(null);
    listAccessCodes()
      .then(({ data }) => setCodes(data))
      .catch(() => setError("We couldn't load access codes. Please try again."))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  function copyCode(code, id) {
    navigator.clipboard?.writeText(code).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  }

  async function handleToggleActive(codeObj) {
    try {
      await updateAccessCode(codeObj.id, { is_active: !codeObj.is_active });
      showToast(codeObj.is_active ? "Access code deactivated." : "Access code reactivated.");
      fetchCodes();
    } catch {
      showToast("Couldn't update that access code.", { type: "error" });
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      await createAccessCode({
        role: formRole,
        max_uses: Number(formMaxUses) || 1,
        ...(formExpiresAt ? { expires_at: new Date(formExpiresAt).toISOString() } : {}),
      });
      showToast("Access code generated.");
      setFormOpen(false);
      setFormMaxUses(1);
      setFormExpiresAt("");
      fetchCodes();
    } catch (err) {
      const data = err.response?.data;
      const message =
        data?.detail ||
        data?.role?.[0] ||
        data?.max_uses?.[0] ||
        "That access code couldn't be created. Please check the fields and try again.";
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap gap-3 justify-between items-center px-5 py-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Access codes
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Share a code with a teacher, student, or guardian so they can sign up
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFormOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-navy-900 dark:bg-brand-blue text-white px-3 py-1.5 rounded-lg hover:opacity-90"
          >
            <Plus size={13} aria-hidden="true" /> Generate code
          </button>
          <button
            onClick={fetchCodes}
            aria-label="Refresh"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5"
          >
            <RefreshCcw size={15} aria-hidden="true" />
          </button>
        </div>
      </div>

      {formOpen && (
        <form
          onSubmit={handleCreate}
          className="px-5 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 flex flex-wrap gap-3 items-end"
        >
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300 block mb-1">
              Role
            </label>
            <select
              value={formRole}
              onChange={(e) => setFormRole(e.target.value)}
              className="text-sm border border-slate-300 dark:border-white/10 bg-white dark:bg-navy-900 rounded-lg px-2.5 py-1.5"
            >
              {issuableRoles.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300 block mb-1">
              Max uses
            </label>
            <input
              type="number"
              min={1}
              value={formMaxUses}
              onChange={(e) => setFormMaxUses(e.target.value)}
              className="w-24 text-sm border border-slate-300 dark:border-white/10 bg-white dark:bg-navy-900 rounded-lg px-2.5 py-1.5"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300 block mb-1">
              Expires (optional)
            </label>
            <input
              type="date"
              value={formExpiresAt}
              onChange={(e) => setFormExpiresAt(e.target.value)}
              className="text-sm border border-slate-300 dark:border-white/10 bg-white dark:bg-navy-900 rounded-lg px-2.5 py-1.5"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="text-sm font-semibold bg-brand-blue text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            {isSubmitting ? "Creating..." : "Create"}
          </button>
          <button
            type="button"
            onClick={() => setFormOpen(false)}
            className="text-sm font-medium text-slate-500 dark:text-slate-400 px-2 py-1.5"
          >
            Cancel
          </button>
          {formError && (
            <p className="w-full text-xs text-rose-500 mt-1">{formError}</p>
          )}
        </form>
      )}

      {isLoading ? (
        <LoadingState label="Loading access codes..." />
      ) : error ? (
        <ErrorState description={error} onRetry={fetchCodes} />
      ) : codes.length === 0 ? (
        <EmptyState
          title="No access codes yet"
          description="Generate one to invite a teacher, student, or guardian to sign up."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                <th className="px-5 py-2.5">Code</th>
                <th className="px-5 py-2.5">Role</th>
                <th className="px-5 py-2.5">Uses</th>
                <th className="px-5 py-2.5">Expires</th>
                <th className="px-5 py-2.5">Status</th>
                <th className="px-5 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c.id} className="border-t border-slate-100 dark:border-white/5">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-xs bg-slate-100 dark:bg-white/10 px-2 py-1 rounded">
                        {c.code}
                      </code>
                      <button
                        onClick={() => copyCode(c.code, c.id)}
                        aria-label="Copy code"
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        {copiedId === c.id ? (
                          <Check size={14} className="text-emerald-500" aria-hidden="true" />
                        ) : (
                          <Copy size={14} aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex text-xs font-medium bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md">
                      {ROLE_LABEL[c.role] || c.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-300">
                    {c.times_used} / {c.max_uses}
                  </td>
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                    {formatDate(c.expires_at)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full
                        ${
                          c.is_active
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                            : "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400"
                        }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          c.is_active ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      />
                      {c.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleToggleActive(c)}
                      className="text-xs font-medium text-brand-blue hover:underline"
                    >
                      {c.is_active ? "Deactivate" : "Reactivate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
