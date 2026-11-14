// Client-safe: imported by the signup/profile forms and by the API routes that set passwords.
// Only enforced when a password is set, so existing shorter passwords still sign in.

export const MIN_PASSWORD_LENGTH = 8;

// bcrypt ignores everything past 72 bytes, so a longer password would silently match any
// password sharing its first 72 bytes. Measured in bytes, not characters.
export const MAX_PASSWORD_BYTES = 72;

/** Returns an error message, or null when the password is acceptable. */
export function validatePassword(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`;
  }
  if (new TextEncoder().encode(password).length > MAX_PASSWORD_BYTES) {
    return 'Password is too long';
  }
  return null;
}
