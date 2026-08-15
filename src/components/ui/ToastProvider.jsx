import React, { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, { type = "success", duration = 3500 } = {}) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type }]);
      if (duration) {
        setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`flex items-start gap-2 rounded-lg shadow-lg px-4 py-3 text-sm text-white
              ${t.type === "error" ? "bg-rose-600" : "bg-navy-900"}`}
          >
            {t.type === "error" ? (
              <XCircle size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
            ) : (
              <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-400" aria-hidden="true" />
            )}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss notification">
              <X size={15} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
