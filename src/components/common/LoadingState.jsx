import React from "react";
import { Loader2 } from "lucide-react";
import PropTypes from "prop-types";

export default function LoadingState({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-slate-400">
      <Loader2 size={28} className="animate-spin mb-3 text-brand-blue" aria-hidden="true" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

LoadingState.propTypes = {
  label: PropTypes.string,
};
