import React, { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCcw, Check, X as XIcon } from "lucide-react";
import {
  listPendingUsers,
  approveOrRejectUser,
  bulkApproveOrRejectUsers,
} from "../../api/accountsApi.js";
import LoadingState from "../../components/common/LoadingState.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";
import { useToast } from "../../components/ui/ToastProvider.jsx";

const ROLE_FILTERS = [
  { value: "", label: "All roles" },
  { value: "teacher", label: "Teacher" },
  { value: "student", label: "Student" },
  { value: "guardian", label: "Guardian" },
  { value: "accountant", label: "Accountant" },
];

const ROLE_BADGE_LABEL = {
  admin: "Admin",
  teacher: "Teacher",
  student: "Student",
  guardian: "Guardian",
  accountant: "Accountant",
};

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function PendingApprovalsPanel() {
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roleFilter, setRoleFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  // Dialog state: either a single-user action or a bulk action.
  const [pendingAction, setPendingAction] = useState(null);
  // shape: { mode: "single" | "bulk", action: "approve" | "reject", userId? }
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const fetchUsers = useCallback(() => {
    setIsLoading(true);
    setError(null);
    listPendingUsers({ role: roleFilter || undefined })
      .then(({ data }) => {
        setUsers(data);
        setSelectedIds([]);
      })
      .catch(() => {
        setError("We couldn't load pending accounts. Please try again.");
      })
      .finally(() => setIsLoading(false));
  }, [roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const allSelected = users.length > 0 && selectedIds.length === users.length;

  function toggleSelectAll() {
    setSelectedIds(allSelected ? [] : users.map((u) => u.id));
  }

  function toggleSelectOne(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function openSingleAction(userId, action) {
    setPendingAction({ mode: "single", action, userId });
  }

  function openBulkAction(action) {
    if (selectedIds.length === 0) return;
    setPendingAction({ mode: "bulk", action });
  }

  async function handleConfirm(reason) {
    if (!pendingAction) return;
    setIsSubmittingAction(true);

    try {
      if (pendingAction.mode === "single") {
        await approveOrRejectUser(pendingAction.userId, {
          action: pendingAction.action,
          reason,
        });
        showToast(
          pendingAction.action === "approve"
            ? "Account approved successfully."
            : "Account rejected."
        );
      } else {
        const { data } = await bulkApproveOrRejectUsers({
          userIds: selectedIds,
          action: pendingAction.action,
          reason,
        });
        showToast(
          `${
            pendingAction.action === "approve"
              ? data.approved_count
              : data.rejected_count
          } account(s) ${pendingAction.action === "approve" ? "approved" : "rejected"}.`
        );
      }
      setPendingAction(null);
      fetchUsers();
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.reason?.[0] ||
        "That action couldn't be completed. Please try again.";
      showToast(message, { type: "error" });
    } finally {
      setIsSubmittingAction(false);
    }
  }

  const dialogConfig = useMemo(() => {
    if (!pendingAction) return null;
    const isReject = pendingAction.action === "reject";
    const count = pendingAction.mode === "bulk" ? selectedIds.length : 1;

    return {
      title: isReject
        ? `Reject ${count > 1 ? `${count} accounts` : "this account"}?`
        : `Approve ${count > 1 ? `${count} accounts` : "this account"}?`,
      description: isReject
        ? "The account holder will be notified. This can't be undone from here."
        : "The account will be activated immediately.",
      confirmLabel: isReject ? "Reject" : "Approve",
      tone: isReject ? "danger" : "default",
      requireReason: isReject,
    };
  }, [pendingAction, selectedIds.length]);

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap gap-3 justify-between items-center px-5 py-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Pending account approvals
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {users.length} awaiting review
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <>
              <button
                onClick={() => openBulkAction("approve")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-navy-900 dark:bg-brand-blue text-white px-3 py-1.5 rounded-lg hover:opacity-90"
              >
                <Check size={13} aria-hidden="true" /> Approve {selectedIds.length}
              </button>
              <button
                onClick={() => openBulkAction("reject")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold border border-rose-200 text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10"
              >
                <XIcon size={13} aria-hidden="true" /> Reject {selectedIds.length}
              </button>
            </>
          )}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs border border-slate-200 dark:border-white/10 bg-white dark:bg-navy-900 rounded-lg px-2.5 py-1.5"
          >
            {ROLE_FILTERS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <button
            onClick={fetchUsers}
            aria-label="Refresh"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5"
          >
            <RefreshCcw size={15} aria-hidden="true" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <LoadingState label="Loading pending accounts..." />
      ) : error ? (
        <ErrorState description={error} onRetry={fetchUsers} />
      ) : users.length === 0 ? (
        <EmptyState
          title="No pending accounts"
          description="New signups awaiting approval will show up here."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                <th className="px-5 py-2.5 w-8">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all pending accounts"
                  />
                </th>
                <th className="px-5 py-2.5">Name</th>
                <th className="px-5 py-2.5">Role</th>
                <th className="px-5 py-2.5">Requested</th>
                <th className="px-5 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-t border-slate-100 dark:border-white/5"
                >
                  <td className="px-5 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(u.id)}
                      onChange={() => toggleSelectOne(u.id)}
                      aria-label={`Select ${u.first_name} ${u.last_name}`}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-800 dark:text-slate-100">
                      {u.first_name} {u.last_name}
                    </p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex text-xs font-medium bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md">
                      {ROLE_BADGE_LABEL[u.role] || u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                    {formatDate(u.date_joined)}
                  </td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => openSingleAction(u.id, "approve")}
                      className="text-xs font-semibold bg-navy-900 dark:bg-brand-blue text-white px-3 py-1.5 rounded-lg mr-1.5 hover:opacity-90"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => openSingleAction(u.id, "reject")}
                      className="text-xs font-semibold border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {dialogConfig && (
        <ConfirmDialog
          open
          title={dialogConfig.title}
          description={dialogConfig.description}
          confirmLabel={dialogConfig.confirmLabel}
          tone={dialogConfig.tone}
          requireReason={dialogConfig.requireReason}
          isSubmitting={isSubmittingAction}
          onConfirm={handleConfirm}
          onCancel={() => setPendingAction(null)}
        />
      )}
    </div>
  );
}
