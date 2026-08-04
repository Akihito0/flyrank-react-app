/**
 * @jest-environment jsdom
 */

/**
 * Unit tests for the LoginForm View component.
 *
 * The useAuth ViewModel hook is mocked entirely — these tests verify that
 * the View:
 *   1. Displays field errors when present (signIn is NOT called).
 *   2. Calls signIn with correct input on valid submission.
 */

import { renderHook } from "@testing-library/react";
import type { UseAuthReturn } from "@/view-models/useAuth";

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

const defaultUseAuthReturn: UseAuthReturn = {
  user: null,
  loading: false,
  error: null,
  fieldErrors: {},
  signUp: mockSignUp,
  signIn: mockSignIn,
  signOut: mockSignOut,
};

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

import { LoginForm } from "../LoginForm";

const testingLib = require("@testing-library/react");
render = testingLib.render;
screen = testingLib.screen;
fireEvent = testingLib.fireEvent;
act = testingLib.act;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthReturnOverride = {};
  });

  // -----------------------------------------------------------------------
  // Field errors shown, signIn NOT called
  // -----------------------------------------------------------------------

  it("shows field errors when present and does NOT call signIn", () => {
    useAuthReturnOverride = {
      fieldErrors: {
        email: "Email is required.",
        password: "Password is required.",
      },
    };

    render(<LoginForm />);

    // Field errors visible with correct accessibility
    const emailError = screen.getByText("Email is required.");
    expect(emailError).toBeDefined();
    expect(emailError.getAttribute("role")).toBe("alert");
    expect(emailError.getAttribute("id")).toBe("login-email-error");

    const passwordError = screen.getByText("Password is required.");
    expect(passwordError).toBeDefined();
    expect(passwordError.getAttribute("role")).toBe("alert");
    expect(passwordError.getAttribute("id")).toBe("login-password-error");

    // Inputs should have aria-invalid
    const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
    expect(emailInput.getAttribute("aria-invalid")).toBe("true");
    expect(emailInput.getAttribute("aria-describedby")).toBe(
      "login-email-error"
    );

    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    expect(passwordInput.getAttribute("aria-invalid")).toBe("true");
    expect(passwordInput.getAttribute("aria-describedby")).toBe(
      "login-password-error"
    );

    // signIn was NOT called
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // Valid submission → signIn called with correct input
  // -----------------------------------------------------------------------

  it("calls signIn with correct input on valid submission", async () => {
    mockSignIn.mockResolvedValue(undefined);

    render(<LoginForm />);

    const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
    const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
    const submitBtn = screen.getByRole("button", { name: /sign in/i });

    // Fill in valid input
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: "user@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
    });

    // Submit the form
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(mockSignIn).toHaveBeenCalledTimes(1);
    expect(mockSignIn).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "password123",
    });
  });

  // -----------------------------------------------------------------------
  // Submit button disabled while loading
  // -----------------------------------------------------------------------

  it("disables submit button while loading", () => {
    useAuthReturnOverride = { loading: true };

    render(<LoginForm />);

    const submitBtn = screen.getByRole("button", { name: /signing in/i });
    expect((submitBtn as HTMLButtonElement).disabled).toBe(true);
  });

  // -----------------------------------------------------------------------
  // Firebase error banner displayed
  // -----------------------------------------------------------------------

  it("shows a general error banner when error is set", () => {
    useAuthReturnOverride = {
      error: "Incorrect password. Please try again.",
    };

    render(<LoginForm />);

    const banner = screen.getByText("Incorrect password. Please try again.");
    expect(banner).toBeDefined();
    expect(banner.getAttribute("role")).toBe("alert");
  });
});
