/**
 * Auth ViewModel Layer
 *
 * Custom React hook that manages authentication state (user, loading, error)
 * and exposes signIn / signUp / signOut actions.
 *
 * All Firebase interaction is delegated to the Service layer — this hook
 * has zero Firebase imports.
 */

"use client";

import { useState, useEffect, useCallback } from "react";

import type { AuthUser, SignUpInput, SignInInput, AuthValidationErrors } from "@/models/auth.model";
import {
  validateSignUpInput,
  validateSignInInput,
  isAuthInputValid,
} from "@/models/auth.model";
import {
  signUp as serviceSignUp,
  signIn as serviceSignIn,
  signOutUser as serviceSignOut,
  onAuthStateChangedListener,
} from "@/services/authService";

// ---------------------------------------------------------------------------
// Hook return type
// ---------------------------------------------------------------------------

export interface UseAuthReturn {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  fieldErrors: AuthValidationErrors;
  signIn: (input: SignInInput) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signOut: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<AuthValidationErrors>({});

  // -----------------------------------------------------------------------
  // Subscribe to auth state changes on mount
  // -----------------------------------------------------------------------

  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    // Cleanup: unsubscribe on unmount to prevent memory leaks
    return unsubscribe;
  }, []);

  // -----------------------------------------------------------------------
  // Actions
  // -----------------------------------------------------------------------

  const signUp = useCallback(async (input: SignUpInput): Promise<void> => {
    setError(null);
    setFieldErrors({});

    const errors = validateSignUpInput(input);
    if (!isAuthInputValid(errors)) {
      setFieldErrors(errors);
      return;
    }

    try {
      setLoading(true);
      const newUser = await serviceSignUp(input);
      setUser(newUser);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Sign-up failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(async (input: SignInInput): Promise<void> => {
    setError(null);
    setFieldErrors({});

    const errors = validateSignInInput(input);
    if (!isAuthInputValid(errors)) {
      setFieldErrors(errors);
      return;
    }

    try {
      setLoading(true);
      const existingUser = await serviceSignIn(input);
      setUser(existingUser);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Sign-in failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await serviceSignOut();
      setUser(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Sign-out failed. Please try again.";
      setError(message);
    }
  }, []);

  return { user, loading, error, fieldErrors, signIn, signUp, signOut };
}
