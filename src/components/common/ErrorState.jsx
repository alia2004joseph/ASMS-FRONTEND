import React from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import PropTypes from "prop-types";

export default function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this data. Please try again.",
  onRetry = null,
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center text-center py-16 px-4"
    >
      <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mb-4">
        <AlertTriangle size={22} className="text-rose-500" aria-hidden="true" />
      </div>
      <p className="font-semibold text-slate-700 dark:text-slate-200">{title}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-blue hover:underline"
        >
          <RefreshCcw size={14} aria-hidden="true" /> Try again
        </button>
      )}
    </div>
  );
}

ErrorState.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  onRetry: PropTypes.func,
};
