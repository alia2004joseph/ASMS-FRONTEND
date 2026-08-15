import React from "react";
import PropTypes from "prop-types";

export default function FormField({
  id,
  label,
  icon: Icon,
  error,
  rightElement = null,
  ...inputProps
}) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </label>
      <div className="form-input-wrap mt-1">
        {Icon && <Icon size={16} className="text-slate-400 mr-2 shrink-0" aria-hidden="true" />}
        <input
          id={id}
          className="w-full outline-none text-sm bg-transparent dark:text-slate-100"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...inputProps}
        />
        {rightElement}
      </div>
      {error && (
        <p id={`${id}-error`} className="text-xs text-rose-500 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}

FormField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType,
  error: PropTypes.string,
  rightElement: PropTypes.node,
};
