import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { User } from '@/types';
import { isUniqueViolation } from './prisma-errors';

// These functions let database errors propagate. Returning null on failure would make an
// outage look like "no such user" (and a failed login look like a wrong password).

// Get user by email
export const getUserByEmail = async (email: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
};

export class UserExistsError extends Error {
  constructor() {
    super('User already exists');
    this.name = 'UserExistsError';
  }
}

/** Throws UserExistsError when the email is taken, including when a concurrent signup wins. */
export const createUser = async (email: string, password: string, name: string): Promise<User> => {
  // Cheap early exit that skips the bcrypt hash; the unique index below is the real guard.
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new UserExistsError();
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    return await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        password: hashedPassword,
        role: 'user',
      },
    });
  } catch (error) {
    if (isUniqueViolation(error, 'email')) throw new UserExistsError();
    throw error;
  }
};

/** Returns the user when the credentials match, null when they don't. Throws on DB errors. */
export const verifyPassword = async (email: string, password: string): Promise<User | null> => {
  const user = await getUserByEmail(email);

  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.password);
  return isValid ? user : null;
};
