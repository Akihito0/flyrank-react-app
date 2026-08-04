/**
 * Home Page — App Layer
 *
 * Wrapped in ProtectedRoute so only authenticated users see this page.
 * Displays the current user's email and a sign-out button.
 *
 * Uses useAuth() for user data and signOut action — no Firebase imports.
 */

"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/view-models/useAuth";

function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-slate-950">
      <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full mb-4">
        <span className="w-2 h-2 bg-emerald-400 rounded-full" />
        Authenticated
      </div>
      <h1 className="text-3xl font-bold text-slate-100 mb-2 tracking-tight">
        Welcome back
      </h1>
      <p className="text-base text-slate-400 mb-8 font-mono">
        You are logged in as {user?.email ?? "unknown"}
      </p>
      <button
        id="signout-btn"
        className="py-2.5 px-6 text-sm font-medium text-slate-400 bg-slate-900 border border-slate-800 rounded-md cursor-pointer transition-all hover:text-slate-200 hover:bg-slate-800 hover:border-slate-600"
        type="button"
        onClick={signOut}
      >
        Sign out
      </button>
    </main>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
