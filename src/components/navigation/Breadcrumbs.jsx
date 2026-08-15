import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function Breadcrumbs({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center flex-wrap gap-1 text-sm text-slate-500 dark:text-slate-400">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1">
              {index > 0 && <ChevronRight size={14} aria-hidden="true" />}
              {isLast || !item.to ? (
                <span className="text-slate-700 dark:text-slate-200 font-medium">{item.label}</span>
              ) : (
                <Link to={item.to} className="hover:underline">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

Breadcrumbs.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      to: PropTypes.string,
    })
  ),
};
