import React from "react";
import PropTypes from "prop-types";
import { School, Shield } from "lucide-react";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6 bg-slate-100 dark:bg-navy-950">
      <div className="w-full max-w-5xl">
        <div className="rounded-2xl overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-navy-900">
          {/* Branding panel: hidden below lg so the form owns the full width on mobile */}
          <div className="hidden lg:flex relative flex-col justify-between p-10 text-white bg-gradient-to-b from-slate-900 to-blue-950 min-h-[560px]">
            <div>
              <div className="w-16 h-16 rounded-full border-2 border-amber-300 flex items-center justify-center mx-auto mb-4">
                <School size={28} className="text-amber-300" aria-hidden="true" />
              </div>
              <h1 className="text-3xl font-bold text-center tracking-wide">ALIA</h1>
              <p className="text-center text-xs tracking-[0.3em] text-blue-200 mt-1">
                SCHOOL MANAGEMENT SYSTEM
              </p>
              <p className="text-center text-blue-100/80 text-sm mt-6 max-w-xs mx-auto">
                A comprehensive platform to manage academics, attendance, grading, finance
                and much more.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 flex gap-3 items-start">
              <Shield size={22} className="text-emerald-300 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-semibold text-sm">Secure Access</p>
                <p className="text-xs text-blue-100/70">
                  Your data is protected with enterprise-grade security.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10 flex flex-col justify-center">{children}</div>
        </div>
        <p className="text-center text-xs text-slate-400 mt-6">
          © {new Date().getFullYear()} ALIA School Management System. All rights reserved.
        </p>
      </div>
    </div>
  );
}

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
