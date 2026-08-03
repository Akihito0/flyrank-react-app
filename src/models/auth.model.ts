/**
 * Auth Model Layer
 *
 * Pure TypeScript types and validation functions for authentication.
 * No Firebase or React imports — framework-agnostic by design.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AuthUser = {
  uid: string;
  email: string | null;
};

export type SignUpInput = {
  email: string;
  password: string;
};

export type SignInInput = {
  email: string;
  password: string;
};

export type AuthValidationErrors = {
  email?: string;
  password?: string;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

// ---------------------------------------------------------------------------
// Validation Functions
// ---------------------------------------------------------------------------

/**
 * Validates sign-up input.
 *
 * - Email must be non-empty and match a basic email pattern.
 * - Password must be non-empty and at least 6 characters (Firebase minimum).
 *
 * Returns an object whose keys are only present when there is an error.
 */
export function validateSignUpInput(input: SignUpInput): AuthValidationErrors {
  const errors: AuthValidationErrors = {};

  if (!input.email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_REGEX.test(input.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!input.password) {
    errors.password = "Password is required.";
  } else if (input.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  return errors;
}

/**
 * Validates sign-in input.
 *
 * Only checks that both fields are non-empty — Firebase itself will reject
 * bad credentials, so we don't re-validate format or length here.
 */
export function validateSignInInput(input: SignInInput): AuthValidationErrors {
  const errors: AuthValidationErrors = {};

  if (!input.email.trim()) {
    errors.email = "Email is required.";
  }

  if (!input.password) {
    errors.password = "Password is required.";
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns `true` when the errors object contains no validation errors.
 */
export function isAuthInputValid(errors: AuthValidationErrors): boolean {
  return Object.keys(errors).length === 0;
}
