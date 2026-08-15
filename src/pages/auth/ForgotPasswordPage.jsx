import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout.jsx";
import FormField from "../../components/auth/FormField.jsx";
import { requestPasswordReset } from "../../api/authApi.js";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError(null);

    if (!email) {
      setFieldError("Email is required.");
      return;
    }
    setFieldError(null);
    setIsLoading(true);
    try {
      await requestPasswordReset({ email });
      setSubmitted(true);
    } catch (err) {
      setApiError(
        err.response?.data?.detail || "We couldn't process that request. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (submitted) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center text-center py-6">
          <CheckCircle2 size={40} className="text-emerald-500 mb-4" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Check your email</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-xs">
            If an account exists for {email}, we've sent instructions to reset your password.
          </p>
          <Link to="/login" className="text-brand-blue font-medium text-sm mt-6">
            Back to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
        Forgot Password?
      </h2>
      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-6">
        Enter your email and we'll send you a link to reset it.
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
          value={email}
          error={fieldError}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <button type="submit" className="btn-primary mt-2" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send Reset Link"}
          {!isLoading && <ArrowRight size={16} aria-hidden="true" />}
        </button>
      </form>

      <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
        Remembered your password?{" "}
        <Link to="/login" className="text-brand-blue font-medium">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
