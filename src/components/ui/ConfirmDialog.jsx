import React, { useState } from "react";
import PropTypes from "prop-types";
import { AlertTriangle } from "lucide-react";

// Generic confirm dialog. If requireReason is true, the confirm button
// stays disabled until non-blank text is entered, and that text is
// passed back to onConfirm — used for account rejection where the
// backend requires a non-empty reason.
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  tone = "default", // "default" | "danger"
  requireReason = false,
  isSubmitting = false,
  onConfirm,
  onCancel,
}) {
  const [reason, setReason] = useState("");

  if (!open) return null;

  const confirmDisabled = isSubmitting || (requireReason && !reason.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={!isSubmitting ? onCancel : undefined}
        aria-hidden="true"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="relative card w-full max-w-sm p-6"
      >
        <div className="flex items-start gap-3 mb-2">
          {tone === "danger" && (
            <div className="w-9 h-9 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-rose-500" aria-hidden="true" />
            </div>
          )}
          <div>
            <h2 id="confirm-dialog-title" className="font-semibold text-slate-800 dark:text-slate-100">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>
            )}
          </div>
        </div>

        {requireReason && (
          <div className="mt-4">
            <label htmlFor="confirm-reason" className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Reason
            </label>
            <textarea
              id="confirm-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this account is being rejected..."
              className="mt-1 w-full text-sm rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-navy-900
                px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-white/10
              text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={confirmDisabled}
            onClick={() => onConfirm(requireReason ? reason.trim() : undefined)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg text-white disabled:opacity-60 disabled:cursor-not-allowed transition
              ${tone === "danger" ? "bg-rose-600 hover:bg-rose-700" : "bg-brand-blue hover:bg-blue-700"}`}
          >
            {isSubmitting ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

ConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  confirmLabel: PropTypes.string,
  tone: PropTypes.oneOf(["default", "danger"]),
  requireReason: PropTypes.bool,
  isSubmitting: PropTypes.bool,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
