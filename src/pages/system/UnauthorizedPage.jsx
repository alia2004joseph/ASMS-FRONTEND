import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-navy-950 p-6">
      <div className="card p-8 max-w-sm w-full text-center">
        <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert size={22} className="text-rose-500" aria-hidden="true" />
        </div>
        <h1 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
          You don't have access to this page
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Your account role doesn't have permission to view this section. Contact your
          administrator if you think this is a mistake.
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
