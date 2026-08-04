/**
 * Unit tests for authService.
 *
 * Firebase Auth is fully mocked — no emulator or network calls required.
 * We verify that authService correctly:
 *   1. Maps Firebase responses to AuthUser.
 *   2. Translates Firebase error codes into readable messages.
 */

// ---------------------------------------------------------------------------
// Mock firebase/auth BEFORE any imports that pull it in
// ---------------------------------------------------------------------------

const mockCreateUser = jest.fn();
const mockSignIn = jest.fn();
const mockSignOut = jest.fn();
const mockOnAuthStateChanged = jest.fn();
const mockCurrentUser: { uid: string; email: string } | null = null;

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({
    get currentUser() {
      return mockCurrentUser;
    },
  })),
  createUserWithEmailAndPassword: (...args: unknown[]) =>
    mockCreateUser(...args),
  signInWithEmailAndPassword: (...args: unknown[]) => mockSignIn(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
  onAuthStateChanged: (...args: unknown[]) => mockOnAuthStateChanged(...args),
}));

// Mock firebaseService so it doesn't try to initialise a real Firebase app
jest.mock("@/services/firebaseService", () => ({
  app: {},
}));

// ---------------------------------------------------------------------------
// Import the module under test (after mocks are in place)
// ---------------------------------------------------------------------------

import { signUp, signIn, signOutUser } from "../authService";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function firebaseUser(uid: string, email: string) {
  return { uid, email };
}

function firebaseError(code: string) {
  const err = new Error(code);
  (err as unknown as Record<string, unknown>).code = code;
  return err;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("authService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // signUp
  // -----------------------------------------------------------------------

  describe("signUp", () => {
    it("returns an AuthUser on successful sign-up", async () => {
      mockCreateUser.mockResolvedValueOnce({
        user: firebaseUser("uid-123", "test@example.com"),
      });

      const result = await signUp({
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      });

      expect(result).toEqual({ uid: "uid-123", email: "test@example.com" });
      expect(mockCreateUser).toHaveBeenCalledTimes(1);
    });

    it("throws a readable error when the email is already in use", async () => {
      mockCreateUser.mockRejectedValueOnce(
        firebaseError("auth/email-already-in-use")
      );

      await expect(
        signUp({ email: "taken@example.com", password: "password123", confirmPassword: "password123" })
      ).rejects.toThrow("An account with this email address already exists.");
    });

    it("throws a readable error for a weak password", async () => {
      mockCreateUser.mockRejectedValueOnce(
        firebaseError("auth/weak-password")
      );

      await expect(
        signUp({ email: "test@example.com", password: "123", confirmPassword: "123" })
      ).rejects.toThrow(/stronger password/i);
    });
  });

  // -----------------------------------------------------------------------
  // signIn
  // -----------------------------------------------------------------------

  describe("signIn", () => {
    it("returns an AuthUser on successful sign-in", async () => {
      mockSignIn.mockResolvedValueOnce({
        user: firebaseUser("uid-456", "user@example.com"),
      });

      const result = await signIn({
        email: "user@example.com",
        password: "correctPassword",
      });

      expect(result).toEqual({ uid: "uid-456", email: "user@example.com" });
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });

    it("throws a readable error for wrong password", async () => {
      mockSignIn.mockRejectedValueOnce(
        firebaseError("auth/wrong-password")
      );

      await expect(
        signIn({ email: "user@example.com", password: "wrongPassword" })
      ).rejects.toThrow("Incorrect password. Please try again.");
    });

    it("throws a readable error for user not found", async () => {
      mockSignIn.mockRejectedValueOnce(
        firebaseError("auth/user-not-found")
      );

      await expect(
        signIn({ email: "nobody@example.com", password: "password123" })
      ).rejects.toThrow("No account found with this email address.");
    });

    it("throws a readable error for invalid credentials", async () => {
      mockSignIn.mockRejectedValueOnce(
        firebaseError("auth/invalid-credential")
      );

      await expect(
        signIn({ email: "user@example.com", password: "bad" })
      ).rejects.toThrow(/check your email and password/i);
    });
  });

  // -----------------------------------------------------------------------
  // signOutUser
  // -----------------------------------------------------------------------

  describe("signOutUser", () => {
    it("calls Firebase signOut successfully", async () => {
      mockSignOut.mockResolvedValueOnce(undefined);

      await expect(signOutUser()).resolves.toBeUndefined();
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });
  });
});
