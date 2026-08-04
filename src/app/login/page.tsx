/**
 * Login Page — App Layer
 *
 * Renders a toggle between the SignUpForm and LoginForm views.
 * All auth logic is delegated to the views, which in turn call useAuth().
 *
 * No Firebase imports, no business logic.
 */

"use client";

import { useState } from "react";

import { SignUpForm } from "@/views/SignUpForm";
import { LoginForm } from "@/views/LoginForm";

type AuthMode = "login" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("login");

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-slate-950">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-center text-slate-100 mb-1 tracking-tight">
          {mode === "login" ? "Welcome back" : "Get started"}
        </h1>
        <p className="text-sm text-slate-400 text-center mb-8">
          {mode === "login"
            ? "Sign in to your account"
            : "Create a new account"}
        </p>

        {/* Mode toggle */}
        <div
          className="flex gap-1 bg-slate-950 rounded-lg p-1 mb-8"
          role="tablist"
          aria-label="Authentication mode"
        >
          <button
            id="toggle-login"
            className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-md cursor-pointer transition-all ${
              mode === "login"
                ? "bg-indigo-500 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
            type="button"
            role="tab"
            aria-selected={mode === "login"}
            onClick={() => setMode("login")}
          >
            Sign in
          </button>
          <button
            id="toggle-signup"
            className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-md cursor-pointer transition-all ${
              mode === "signup"
                ? "bg-indigo-500 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
            type="button"
            role="tab"
            aria-selected={mode === "signup"}
            onClick={() => setMode("signup")}
          >
            Sign up
          </button>
        </div>

        {/* Active form */}
        {mode === "login" ? <LoginForm /> : <SignUpForm />}
      </div>
    </div>
  );
}
