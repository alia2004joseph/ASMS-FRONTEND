import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout.jsx";
import FormField from "../../components/auth/FormField.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { getRouteForRole } from "../../utils/roleRedirect.js";

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "", rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState(null);

  function validate() {
    const errors = {};
    if (!form.email) errors.email = "Email is required.";
    if (!form.password) errors.password = "Password is required.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError(null);
    if (!validate()) return;

    try {
      const user = await login({ email: form.email, password: form.password });
      const redirectTo = location.state?.from || getRouteForRole(user.role);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setApiError(
        err.response?.data?.detail ||
          "We couldn't sign you in. Check your email and password and try again."
      );
    }
  }

  return (
    <AuthLayout>
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
        Welcome Back!
      </h2>
      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-6">
        Sign in to your account to continue
      </p>

      {apiError && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-sm px-3 py-2"
        >
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <FormField
          id="email"
          label="Email Address"
          icon={Mail}
          type="email"
          placeholder="Enter your email"
          value={form.email}
          error={fieldErrors.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          autoComplete="email"
        />

        <FormField
          id="password"
          label="Password"
          icon={Lock}
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          value={form.password}
          error={fieldErrors.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          autoComplete="current-password"
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff size={16} className="text-slate-400" aria-hidden="true" />
              ) : (
                <Eye size={16} className="text-slate-400" aria-hidden="true" />
              )}
            </button>
          }
        />

        <div className="flex items-center justify-between text-sm mb-5">
          <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              className="rounded"
              checked={form.rememberMe}
              onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-brand-blue font-medium">
            Forgot password?
          </Link>
        </div>

        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
          {!isLoading && <ArrowRight size={16} aria-hidden="true" />}
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs text-slate-400 my-4">
        <div className="h-px bg-slate-200 dark:bg-white/10 flex-1" /> OR{" "}
        <div className="h-px bg-slate-200 dark:bg-white/10 flex-1" />
      </div>

      <Link
        to="/signup"
        className="w-full border border-blue-300 text-brand-blue rounded-lg py-3 font-semibold flex items-center justify-center gap-2 mb-6"
      >
        <Shield size={16} aria-hidden="true" /> Sign in with Access Code
      </Link>

      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
        Don&apos;t have an account?{" "}
        <Link to="/signup" className="text-brand-blue font-medium">
          Contact your school administrator.
        </Link>
      </p>
    </AuthLayout>
  );
}
