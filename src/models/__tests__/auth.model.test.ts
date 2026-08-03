import {
  validateSignUpInput,
  validateSignInInput,
  isAuthInputValid,
} from "../auth.model";

// ---------------------------------------------------------------------------
// validateSignUpInput
// ---------------------------------------------------------------------------

describe("validateSignUpInput", () => {
  it("returns no errors for valid input", () => {
    const errors = validateSignUpInput({
      email: "user@example.com",
      password: "securePass1",
    });

    expect(isAuthInputValid(errors)).toBe(true);
    expect(errors.email).toBeUndefined();
    expect(errors.password).toBeUndefined();
  });

  it("returns an error when email is empty", () => {
    const errors = validateSignUpInput({
      email: "",
      password: "securePass1",
    });

    expect(isAuthInputValid(errors)).toBe(false);
    expect(errors.email).toBeDefined();
  });

  it("returns an error when email is whitespace-only", () => {
    const errors = validateSignUpInput({
      email: "   ",
      password: "securePass1",
    });

    expect(isAuthInputValid(errors)).toBe(false);
    expect(errors.email).toBeDefined();
  });

  it("returns an error for an invalid email format", () => {
    const errors = validateSignUpInput({
      email: "not-an-email",
      password: "securePass1",
    });

    expect(isAuthInputValid(errors)).toBe(false);
    expect(errors.email).toMatch(/valid email/i);
  });

  it("returns an error when password is empty", () => {
    const errors = validateSignUpInput({
      email: "user@example.com",
      password: "",
    });

    expect(isAuthInputValid(errors)).toBe(false);
    expect(errors.password).toBeDefined();
  });

  it("returns an error when password is under 6 characters", () => {
    const errors = validateSignUpInput({
      email: "user@example.com",
      password: "abc12",
    });

    expect(isAuthInputValid(errors)).toBe(false);
    expect(errors.password).toMatch(/at least 6/i);
  });

  it("accepts a password that is exactly 6 characters", () => {
    const errors = validateSignUpInput({
      email: "user@example.com",
      password: "abc123",
    });

    expect(isAuthInputValid(errors)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateSignInInput
// ---------------------------------------------------------------------------

describe("validateSignInInput", () => {
  it("returns no errors when both fields are non-empty", () => {
    const errors = validateSignInInput({
      email: "user@example.com",
      password: "anything",
    });

    expect(isAuthInputValid(errors)).toBe(true);
  });

  it("returns an error when email is empty", () => {
    const errors = validateSignInInput({
      email: "",
      password: "anything",
    });

    expect(isAuthInputValid(errors)).toBe(false);
    expect(errors.email).toBeDefined();
  });

  it("returns an error when password is empty", () => {
    const errors = validateSignInInput({
      email: "user@example.com",
      password: "",
    });

    expect(isAuthInputValid(errors)).toBe(false);
    expect(errors.password).toBeDefined();
  });

  it("returns errors when both fields are empty", () => {
    const errors = validateSignInInput({
      email: "",
      password: "",
    });

    expect(isAuthInputValid(errors)).toBe(false);
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeDefined();
  });

  it("does NOT validate email format (Firebase handles that)", () => {
    const errors = validateSignInInput({
      email: "not-an-email",
      password: "short",
    });

    // Both fields are non-empty, so no client-side errors
    expect(isAuthInputValid(errors)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// isAuthInputValid
// ---------------------------------------------------------------------------

describe("isAuthInputValid", () => {
  it("returns true for an empty errors object", () => {
    expect(isAuthInputValid({})).toBe(true);
  });

  it("returns false when email error is present", () => {
    expect(isAuthInputValid({ email: "Bad" })).toBe(false);
  });

  it("returns false when password error is present", () => {
    expect(isAuthInputValid({ password: "Bad" })).toBe(false);
  });
});
