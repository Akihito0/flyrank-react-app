/**
 * Auth Service Layer
 *
 * Wraps Firebase Authentication SDK calls and maps results to the AuthUser
 * model type. All Firebase-specific error codes are translated into plain
 * Error objects with human-readable messages so that upper layers (ViewModels,
 * Views) never see raw Firebase internals.
 *
 * No React imports, no component state — pure async functions.
 */

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type Auth,
  type User,
} from "firebase/auth";

import { app } from "@/services/firebaseService";
import type { AuthUser, SignUpInput, SignInInput } from "@/models/auth.model";

// ---------------------------------------------------------------------------
// Firebase Auth instance (singleton via the shared app)
// ---------------------------------------------------------------------------

const auth: Auth = getAuth(app);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Maps a Firebase `User` object to our lean `AuthUser` model type.
 */
function mapFirebaseUser(user: User): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
  };
}

/**
 * Firebase Auth error codes → user-friendly messages.
 *
 * Only codes that can surface during email/password auth are listed here.
 * Any unrecognised code falls through to a generic message.
 */
const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  "auth/email-already-in-use":
    "An account with this email address already exists.",
  "auth/invalid-email": "The email address is not valid.",
  "auth/operation-not-allowed":
    "Email/password sign-in is not enabled. Please contact support.",
  "auth/weak-password":
    "The password is too weak. Please choose a stronger password.",
  "auth/user-disabled":
    "This account has been disabled. Please contact support.",
  "auth/user-not-found": "No account found with this email address.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/invalid-credential":
    "Invalid credentials. Please check your email and password.",
  "auth/too-many-requests":
    "Too many failed attempts. Please try again later.",
};

/**
 * Extracts a Firebase error code from the error object and returns a
 * human-readable message. If the code is unrecognised, a generic message
 * is returned.
 */
function toReadableError(error: unknown): Error {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as Record<string, unknown>).code === "string"
  ) {
    const code = (error as Record<string, unknown>).code as string;
    const message =
      FIREBASE_ERROR_MESSAGES[code] ??
      "An unexpected authentication error occurred. Please try again.";
    return new Error(message);
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error(
    "An unexpected authentication error occurred. Please try again."
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Creates a new user account with email and password.
 *
 * Only `email` and `password` are forwarded to Firebase —
 * `confirmPassword` is intentionally excluded (validation-only field).
 *
 * @throws {Error} Readable error if Firebase rejects the request.
 */
export async function signUp(input: SignUpInput): Promise<AuthUser> {
  const { email, password } = input;
  try {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return mapFirebaseUser(credential.user);
  } catch (error: unknown) {
    throw toReadableError(error);
  }
}

/**
 * Signs in an existing user with email and password.
 *
 * @throws {Error} Readable error if Firebase rejects the credentials.
 */
export async function signIn(input: SignInInput): Promise<AuthUser> {
  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      input.email,
      input.password
    );
    return mapFirebaseUser(credential.user);
  } catch (error: unknown) {
    throw toReadableError(error);
  }
}

/**
 * Signs out the currently authenticated user.
 */
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: unknown) {
    throw toReadableError(error);
  }
}

/**
 * Reads the current Firebase Auth user synchronously.
 *
 * Returns `null` when no user is signed in.
 */
export function getCurrentUser(): AuthUser | null {
  const user = auth.currentUser;
  return user ? mapFirebaseUser(user) : null;
}

/**
 * Subscribes to Firebase Auth state changes.
 *
 * @returns An unsubscribe function that removes the listener.
 */
export function onAuthStateChangedListener(
  callback: (user: AuthUser | null) => void
): () => void {
  return onAuthStateChanged(auth, (firebaseUser) => {
    callback(firebaseUser ? mapFirebaseUser(firebaseUser) : null);
  });
}
