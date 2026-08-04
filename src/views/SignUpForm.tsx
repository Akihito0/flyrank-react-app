/**
 * SignUpForm — View Layer
 *
 * Renders a sign-up form with email, password, and confirm password fields.
 * Delegates all auth logic to the useAuth ViewModel hook.
 *
 * - Per-field validation errors displayed inline (aria-invalid, aria-describedby, role="alert").
 * - Firebase-level errors shown as a general banner.
 * - Submit button disabled while loading.
 *
 * No Firebase imports, no business logic.
 */

"use client";

import { useState, type FormEvent } from "react";

import { useAuth } from "@/view-models/useAuth";

export function SignUpForm() {
  const { signUp, loading, error, fieldErrors } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await signUp({ email, password, confirmPassword });
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
      {/* Firebase / network error banner */}
      {error && (
        <div
          className="px-4 py-3 text-sm text-red-400 bg-red-400/10 border border-red-400/25 rounded-md"
          role="alert"
          id="signup-error-banner"
        >
          {error}
        </div>
      )}

      {/* Email field */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-400" htmlFor="signup-email">
          Email
        </label>
        <input
          id="signup-email"
          className={`w-full px-4 py-3 text-[15px] text-slate-200 bg-slate-950 border rounded-md outline-none transition-colors ${
            fieldErrors.email
              ? "border-red-400 ring-2 ring-red-400/10 focus:border-red-400 focus:ring-red-400/20"
              : "border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          }`}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!fieldErrors.email}
          aria-describedby={fieldErrors.email ? "signup-email-error" : undefined}
        />
        {fieldErrors.email && (
          <p className="text-sm text-red-400" id="signup-email-error" role="alert">
            {fieldErrors.email}
          </p>
        )}
      </div>

      {/* Password field */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-400" htmlFor="signup-password">
          Password
        </label>
        <input
          id="signup-password"
          className={`w-full px-4 py-3 text-[15px] text-slate-200 bg-slate-950 border rounded-md outline-none transition-colors ${
            fieldErrors.password
              ? "border-red-400 ring-2 ring-red-400/10 focus:border-red-400 focus:ring-red-400/20"
              : "border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          }`}
          type="password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={!!fieldErrors.password}
          aria-describedby={
            fieldErrors.password ? "signup-password-error" : undefined
          }
        />
        {fieldErrors.password && (
          <p className="text-sm text-red-400" id="signup-password-error" role="alert">
            {fieldErrors.password}
          </p>
        )}
      </div>

      {/* Confirm password field */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-400" htmlFor="signup-confirm-password">
          Confirm password
        </label>
        <input
          id="signup-confirm-password"
          className={`w-full px-4 py-3 text-[15px] text-slate-200 bg-slate-950 border rounded-md outline-none transition-colors ${
            fieldErrors.confirmPassword
              ? "border-red-400 ring-2 ring-red-400/10 focus:border-red-400 focus:ring-red-400/20"
              : "border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          }`}
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          aria-invalid={!!fieldErrors.confirmPassword}
          aria-describedby={
            fieldErrors.confirmPassword ? "signup-confirm-password-error" : undefined
          }
        />
        {fieldErrors.confirmPassword && (
          <p className="text-sm text-red-400" id="signup-confirm-password-error" role="alert">
            {fieldErrors.confirmPassword}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        id="signup-submit"
        className="w-full py-3 px-6 mt-1 text-[15px] font-semibold text-white bg-indigo-500 rounded-md transition-all hover:bg-indigo-400 hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        type="submit"
        disabled={loading}
      >
        {loading && (
          <span className="inline-block w-4 h-4 mr-2 border-2 border-white/25 border-t-white rounded-full animate-spin align-middle" />
        )}
        {loading ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
