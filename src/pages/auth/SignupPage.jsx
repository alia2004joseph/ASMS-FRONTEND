import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, User, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout.jsx";
import FormField from "../../components/auth/FormField.jsx";
import { signupWithAccessCode } from "../../api/authApi.js";

const initialForm = {
  accessCode: "",
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
};

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  function update(key) {
    return (e) =>
      setForm((f) => ({
        ...f,
        [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
      }));
  }

  function validate() {
    const errors = {};
    if (!form.accessCode) errors.accessCode = "Access code is required.";
    if (!form.firstName) errors.firstName = "First name is required.";
    if (!form.lastName) errors.lastName = "Last name is required.";
    if (!form.email) errors.email = "Email is required.";
    if (!form.password) errors.password = "Password is required.";
    if (form.password && form.password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }
    if (form.confirmPassword !== form.password) {
      errors.confirmPassword = "Passwords do not match.";
    }
    if (!form.acceptTerms) errors.acceptTerms = "You must accept the terms to continue.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError(null);
    if (!validate()) return;

    setIsLoading(true);
    try {
      await signupWithAccessCode({
        accessCode: form.accessCode,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });
      navigate("/login", { replace: true });
    } catch (err) {
      setApiError(
        err.response?.data?.detail ||
          "We couldn't create your account. Check your access code and try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout>
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
        Create Your Account
      </h2>
      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-6">
        Enter the access code provided by your school administrator.
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
          id="accessCode"
          label="Access Code"
          icon={KeyRound}
          placeholder="Enter your access code"
          value={form.accessCode}
          error={fieldErrors.accessCode}
          onChange={update("accessCode")}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-3">
          <FormField
            id="firstName"
            label="First Name"
            icon={User}
            placeholder="First name"
            value={form.firstName}
            error={fieldErrors.firstName}
            onChange={update("firstName")}
            autoComplete="given-name"
          />
          <FormField
            id="lastName"
            label="Last Name"
            icon={User}
            placeholder="Last name"
            value={form.lastName}
            error={fieldErrors.lastName}
            onChange={update("lastName")}
            autoComplete="family-name"
          />
        </div>

        <FormField
          id="email"
          label="Email Address"
          icon={Mail}
          type="email"
          placeholder="Enter your email"
          value={form.email}
          error={fieldErrors.email}
          onChange={update("email")}
          autoComplete="email"
        />

        <FormField
          id="password"
          label="Password"
          icon={Lock}
          type={showPassword ? "text" : "password"}
          placeholder="Create a password"
          value={form.password}
          error={fieldErrors.password}
          onChange={update("password")}
          autoComplete="new-password"
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

        <FormField
          id="confirmPassword"
          label="Confirm Password"
          icon={Lock}
          type={showPassword ? "text" : "password"}
          placeholder="Re-enter your password"
          value={form.confirmPassword}
          error={fieldErrors.confirmPassword}
          onChange={update("confirmPassword")}
          autoComplete="new-password"
        />

        <label className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300 mb-1">
          <input
            type="checkbox"
            className="rounded mt-0.5"
            checked={form.acceptTerms}
            onChange={update("acceptTerms")}
          />
          I agree to the terms of service and privacy policy.
        </label>
        {fieldErrors.acceptTerms && (
          <p className="text-xs text-rose-500 mb-3">{fieldErrors.acceptTerms}</p>
        )}

        <button type="submit" className="btn-primary mt-4" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Create Account"}
          {!isLoading && <ArrowRight size={16} aria-hidden="true" />}
        </button>
      </form>

      <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-brand-blue font-medium">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
