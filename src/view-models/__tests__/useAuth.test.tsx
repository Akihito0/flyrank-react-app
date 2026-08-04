/**
 * @jest-environment jsdom
 */

/**
 * Unit tests for the useAuth ViewModel hook.
 *
 * The entire Service layer is mocked — these tests verify that the hook:
 *   1. Starts in loading: true state.
 *   2. Reacts to the auth state listener firing.
 *   3. Surfaces service errors into the error state.
 *   4. Validates input (including confirmPassword) before calling the service.
 */

import { renderHook, act } from "@testing-library/react";

// ---------------------------------------------------------------------------
// Mock the authService module BEFORE importing the hook
// ---------------------------------------------------------------------------

const mockSignUp = jest.fn();
const mockSignIn = jest.fn();
const mockSignOutUser = jest.fn();

// Capture the callback that useAuth passes to onAuthStateChangedListener
// so we can fire it manually in tests.
let capturedAuthCallback: ((user: { uid: string; email: string } | null) => void) | null =
  null;
const mockUnsubscribe = jest.fn();

jest.mock("@/services/authService", () => ({
  signUp: (...args: unknown[]) => mockSignUp(...args),
  signIn: (...args: unknown[]) => mockSignIn(...args),
  signOutUser: (...args: unknown[]) => mockSignOutUser(...args),
  onAuthStateChangedListener: (
    cb: (user: { uid: string; email: string } | null) => void
  ) => {
    capturedAuthCallback = cb;
    return mockUnsubscribe;
  },
}));

// ---------------------------------------------------------------------------
// Import the hook under test (after mocks are in place)
// ---------------------------------------------------------------------------

import { useAuth } from "../useAuth";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useAuth", () => {
  beforeEach(() => {
    capturedAuthCallback = null;
    jest.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // Initial state
  // -----------------------------------------------------------------------

  it("starts with loading: true, user: null, error: null, fieldErrors: {}", () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.fieldErrors).toEqual({});
  });

  // -----------------------------------------------------------------------
  // Auth state listener
  // -----------------------------------------------------------------------

  it("sets user and loading: false when the auth listener fires with a user", () => {
    const { result } = renderHook(() => useAuth());

    // Simulate Firebase notifying us that a user is signed in
    act(() => {
      capturedAuthCallback?.({ uid: "uid-abc", email: "test@example.com" });
    });

    expect(result.current.user).toEqual({
      uid: "uid-abc",
      email: "test@example.com",
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets user to null when the auth listener fires with null", () => {
    const { result } = renderHook(() => useAuth());

    // First fire with a user, then fire with null (sign-out scenario)
    act(() => {
      capturedAuthCallback?.({ uid: "uid-abc", email: "test@example.com" });
    });
    act(() => {
      capturedAuthCallback?.(null);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("calls unsubscribe on unmount", () => {
    const { unmount } = renderHook(() => useAuth());

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  // -----------------------------------------------------------------------
  // signIn error handling
  // -----------------------------------------------------------------------

  it("sets error when signIn throws", async () => {
    mockSignIn.mockRejectedValueOnce(new Error("Incorrect password. Please try again."));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn({
        email: "user@example.com",
        password: "wrong",
      });
    });

    expect(result.current.error).toBe("Incorrect password. Please try again.");
    expect(result.current.fieldErrors).toEqual({});
    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBeNull();
  });

  // -----------------------------------------------------------------------
  // signUp error handling
  // -----------------------------------------------------------------------

  it("sets error when signUp throws", async () => {
    mockSignUp.mockRejectedValueOnce(
      new Error("An account with this email address already exists.")
    );

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signUp({
        email: "taken@example.com",
        password: "password123",
        confirmPassword: "password123",
      });
    });

    expect(result.current.error).toBe(
      "An account with this email address already exists."
    );
    expect(result.current.fieldErrors).toEqual({});
    expect(result.current.loading).toBe(false);
  });

  // -----------------------------------------------------------------------
  // signUp success
  // -----------------------------------------------------------------------

  it("sets user on successful signUp", async () => {
    mockSignUp.mockResolvedValueOnce({
      uid: "new-uid",
      email: "new@example.com",
    });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signUp({
        email: "new@example.com",
        password: "password123",
        confirmPassword: "password123",
      });
    });

    expect(result.current.user).toEqual({
      uid: "new-uid",
      email: "new@example.com",
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.fieldErrors).toEqual({});
  });

  // -----------------------------------------------------------------------
  // signOut
  // -----------------------------------------------------------------------

  it("clears user on successful signOut", async () => {
    mockSignOutUser.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useAuth());

    // Simulate a signed-in user first
    act(() => {
      capturedAuthCallback?.({ uid: "uid-abc", email: "test@example.com" });
    });
    expect(result.current.user).not.toBeNull();

    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.fieldErrors).toEqual({});
  });

  // -----------------------------------------------------------------------
  // signUp — client-side validation
  // -----------------------------------------------------------------------

  describe("signUp — client-side validation", () => {
    it("rejects empty email without calling the service", async () => {
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp({ email: "  ", password: "password123", confirmPassword: "password123" });
      });

      expect(result.current.fieldErrors.email).toBe("Email is required.");
      expect(result.current.error).toBeNull();
      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it("rejects invalid email format without calling the service", async () => {
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp({ email: "not-an-email", password: "password123", confirmPassword: "password123" });
      });

      expect(result.current.fieldErrors.email).toBe("Please enter a valid email address.");
      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it("rejects short password without calling the service", async () => {
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp({ email: "user@example.com", password: "abc", confirmPassword: "abc" });
      });

      expect(result.current.fieldErrors.password).toBe(
        "Password must be at least 6 characters."
      );
      expect(result.current.error).toBeNull();
      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it("rejects mismatched confirmPassword without calling the service", async () => {
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp({
          email: "user@example.com",
          password: "password123",
          confirmPassword: "different456",
        });
      });

      expect(result.current.fieldErrors.confirmPassword).toBe(
        "Passwords do not match."
      );
      expect(result.current.error).toBeNull();
      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it("clears previous fieldErrors on a valid submission", async () => {
      mockSignUp.mockResolvedValueOnce({ uid: "uid-1", email: "a@b.com" });
      const { result } = renderHook(() => useAuth());

      // First call: invalid → fieldErrors populated
      await act(async () => {
        await result.current.signUp({ email: "", password: "", confirmPassword: "" });
      });
      expect(result.current.fieldErrors.email).toBeDefined();

      // Second call: valid → fieldErrors cleared, service called
      await act(async () => {
        await result.current.signUp({ email: "a@b.com", password: "password123", confirmPassword: "password123" });
      });
      expect(result.current.fieldErrors).toEqual({});
      expect(mockSignUp).toHaveBeenCalledTimes(1);
    });
  });

  // -----------------------------------------------------------------------
  // signIn — client-side validation
  // -----------------------------------------------------------------------

  describe("signIn — client-side validation", () => {
    it("rejects empty email without calling the service", async () => {
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn({ email: "  ", password: "password123" });
      });

      expect(result.current.fieldErrors.email).toBe("Email is required.");
      expect(result.current.error).toBeNull();
      expect(mockSignIn).not.toHaveBeenCalled();
    });

    it("rejects empty password without calling the service", async () => {
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn({ email: "user@example.com", password: "" });
      });

      expect(result.current.fieldErrors.password).toBe("Password is required.");
      expect(result.current.error).toBeNull();
      expect(mockSignIn).not.toHaveBeenCalled();
    });

    it("proceeds to the service when both fields are non-empty", async () => {
      mockSignIn.mockResolvedValueOnce({ uid: "uid-2", email: "user@example.com" });
      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn({ email: "user@example.com", password: "password123" });
      });

      expect(result.current.fieldErrors).toEqual({});
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
  });
});
