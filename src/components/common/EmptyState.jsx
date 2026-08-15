import React from "react";
import { Inbox } from "lucide-react";
import PropTypes from "prop-types";

export default function EmptyState({
  title = "Nothing here yet",
  description = "There's no data to show right now.",
  action = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
        <Inbox size={22} className="text-slate-400" aria-hidden="true" />
      </div>
      <p className="font-semibold text-slate-700 dark:text-slate-200">{title}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

EmptyState.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  action: PropTypes.node,
};
