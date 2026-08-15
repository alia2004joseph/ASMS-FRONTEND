import React from "react";
import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-navy-950 p-6">
      <div className="card p-8 max-w-sm w-full text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
          <Compass size={22} className="text-slate-400" aria-hidden="true" />
        </div>
        <h1 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
          Page not found
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          The page you're looking for doesn't exist or has moved.
        </p>
        <Link
          to="/login"
          className="inline-block mt-6 text-sm font-medium text-brand-blue hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
