/**
 * ProtectedRoute — Component Layer
 *
 * Wraps children behind authentication. Uses only the useAuth ViewModel hook.
 *
 * - While `loading` is true: renders a loading indicator (avoids false
 *   "logged out" flash during Firebase session hydration).
 * - If `loading` is false and `user` is null: redirects to /login.
 * - Otherwise: renders children.
 *
 * No Firebase imports, no business logic.
 */

"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/view-models/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  // Firebase session hydration in progress — show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div
          className="w-10 h-10 border-[3px] border-slate-800 border-t-indigo-500 rounded-full animate-spin"
          aria-label="Loading"
        />
      </div>
    );
  }

  // Not authenticated — don't render children (redirect is pending in useEffect)
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div
          className="w-10 h-10 border-[3px] border-slate-800 border-t-indigo-500 rounded-full animate-spin"
          aria-label="Redirecting"
        />
      </div>
    );
  }

  return <>{children}</>;
}
