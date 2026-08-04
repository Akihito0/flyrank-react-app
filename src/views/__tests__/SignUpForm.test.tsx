/**
 * @jest-environment jsdom
 */

/**
 * Unit tests for the SignUpForm View component.
 *
 * The useAuth ViewModel hook is mocked entirely — these tests verify that
 * the View:
 *   1. Displays field errors on empty submission (signUp is NOT called).
 *   2. Calls signUp with correct input on valid submission (including confirmPassword).
 */

import { renderHook } from "@testing-library/react";
import type { UseAuthReturn } from "@/view-models/useAuth";

// We need render, screen, fireEvent but must import after mocks
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let render: typeof import("@testing-library/react").render;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let screen: typeof import("@testing-library/react").screen;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let fireEvent: typeof import("@testing-library/react").fireEvent;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let act: typeof import("@testing-library/react").act;

// ---------------------------------------------------------------------------
// Mock useAuth at the module level BEFORE importing the component
// ---------------------------------------------------------------------------

const mockSignUp = jest.fn();
const mockSignIn = jest.fn();
const mockSignOut = jest.fn();

// Default mock return value — no errors, not loading
const defaultUseAuthReturn: UseAuthReturn = {
  user: null,
  loading: false,
  error: null,
  fieldErrors: {},
  signUp: mockSignUp,
  signIn: mockSignIn,
  signOut: mockSignOut,
};

// Allow tests to override the return value
let useAuthReturnOverride: Partial<UseAuthReturn> = {};

jest.mock("@/view-models/useAuth", () => ({
  useAuth: () => ({
    ...defaultUseAuthReturn,
    ...useAuthReturnOverride,
  }),
}));

// ---------------------------------------------------------------------------
// Import component and testing utilities AFTER mocks
// ---------------------------------------------------------------------------

import { SignUpForm } from "../SignUpForm";

// Re-import testing utilities
const testingLib = require("@testing-library/react");
render = testingLib.render;
screen = testingLib.screen;
fireEvent = testingLib.fireEvent;
act = testingLib.act;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("SignUpForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthReturnOverride = {};
  });

  // -----------------------------------------------------------------------
  // Empty submission → field errors shown, signUp NOT called
  // -----------------------------------------------------------------------

  it("shows field errors on empty submission and does NOT call signUp", async () => {
    // Render with fieldErrors already populated (simulating post-validation state)
    useAuthReturnOverride = {
      fieldErrors: {
        email: "Email is required.",
        password: "Password is required.",
        confirmPassword: "Passwords do not match.",
      },
    };

    render(<SignUpForm />);

    // Field errors should be visible with correct accessibility attributes
    const emailError = screen.getByText("Email is required.");
    expect(emailError).toBeDefined();
    expect(emailError.getAttribute("role")).toBe("alert");
    expect(emailError.getAttribute("id")).toBe("signup-email-error");

    const passwordError = screen.getByText("Password is required.");
    expect(passwordError).toBeDefined();
    expect(passwordError.getAttribute("role")).toBe("alert");
    expect(passwordError.getAttribute("id")).toBe("signup-password-error");

    const confirmPasswordError = screen.getByText("Passwords do not match.");
    expect(confirmPasswordError).toBeDefined();
    expect(confirmPasswordError.getAttribute("role")).toBe("alert");
    expect(confirmPasswordError.getAttribute("id")).toBe("signup-confirm-password-error");

    // Inputs should have aria-invalid
    const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
    expect(emailInput.getAttribute("aria-invalid")).toBe("true");
    expect(emailInput.getAttribute("aria-describedby")).toBe(
      "signup-email-error"
    );

    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    expect(passwordInput.getAttribute("aria-invalid")).toBe("true");
    expect(passwordInput.getAttribute("aria-describedby")).toBe(
      "signup-password-error"
    );

    const confirmPasswordInput = screen.getByLabelText("Confirm password") as HTMLInputElement;
    expect(confirmPasswordInput.getAttribute("aria-invalid")).toBe("true");
    expect(confirmPasswordInput.getAttribute("aria-describedby")).toBe(
      "signup-confirm-password-error"
    );

    expect(mockSignUp).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // Valid submission → signUp called with correct input
  // -----------------------------------------------------------------------

  it("calls signUp with correct input on valid submission", async () => {
    mockSignUp.mockResolvedValue(undefined);

    render(<SignUpForm />);

    const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText("Confirm password") as HTMLInputElement;
    const submitBtn = screen.getByRole("button", { name: /create account/i });

    // Fill in valid input
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: "user@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, { target: { value: "password123" } });
    });

    // Submit the form
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(mockSignUp).toHaveBeenCalledTimes(1);
    expect(mockSignUp).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "password123",
      confirmPassword: "password123",
    });
  });

  // -----------------------------------------------------------------------
  // Submit button disabled while loading
  // -----------------------------------------------------------------------

  it("disables submit button while loading", () => {
    useAuthReturnOverride = { loading: true };

    render(<SignUpForm />);

    const submitBtn = screen.getByRole("button", {
      name: /creating account/i,
    });
    expect((submitBtn as HTMLButtonElement).disabled).toBe(true);
  });

  // -----------------------------------------------------------------------
  // Firebase error banner displayed
  // -----------------------------------------------------------------------

  it("shows a general error banner when error is set", () => {
    useAuthReturnOverride = {
      error: "An account with this email address already exists.",
    };

    render(<SignUpForm />);

    const banner = screen.getByText(
      "An account with this email address already exists."
    );
    expect(banner).toBeDefined();
    expect(banner.getAttribute("role")).toBe("alert");
  });
});
