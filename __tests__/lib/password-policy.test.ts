import { MIN_PASSWORD_LENGTH, validatePassword } from '@/lib/password-policy';

describe('validatePassword', () => {
  it('rejects passwords shorter than the minimum', () => {
    expect(validatePassword('a'.repeat(MIN_PASSWORD_LENGTH - 1))).toMatch(/at least 8/);
  });

  it('accepts passwords at the minimum length', () => {
    expect(validatePassword('a'.repeat(MIN_PASSWORD_LENGTH))).toBeNull();
  });

  it('rejects passwords bcrypt would truncate, counting bytes not characters', () => {
    expect(validatePassword('a'.repeat(72))).toBeNull();
    expect(validatePassword('a'.repeat(73))).toBe('Password is too long');
    // 25 three-byte characters = 75 bytes, though only 25 characters.
    expect(validatePassword('€'.repeat(25))).toBe('Password is too long');
  });
});
