import React, { useState } from "react";
import Breadcrumbs from "../../../components/navigation/Breadcrumbs.jsx";
import PendingApprovalsPanel from "../../../features/accounts/PendingApprovalsPanel.jsx";
import AccessCodesPanel from "../../../features/accounts/AccessCodesPanel.jsx";

const TABS = [
  { key: "approvals", label: "Pending approvals" },
  { key: "access-codes", label: "Access codes" },
];

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState("approvals");

  return (
    <div>
      <Breadcrumbs items={[{ label: "Dashboard", to: "" }, { label: "Users" }]} />
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Users</h1>
      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
        Approve new accounts and manage signup access codes
      </p>

      <div className="flex gap-1 border-b border-slate-200 dark:border-white/10 mt-6 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2.5 text-sm border-b-2 transition
              ${
                activeTab === t.key
                  ? "text-slate-900 dark:text-white font-semibold border-brand-blue"
                  : "text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-300"
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "approvals" ? <PendingApprovalsPanel /> : <AccessCodesPanel />}
    </div>
  );
}
