/**
 * @jest-environment node
 */
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  createUser,
  getUserByEmail,
  UserExistsError,
  verifyPassword,
} from '@/lib/users-db';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const user = prisma.user as unknown as Record<string, jest.Mock>;

beforeEach(() => jest.resetAllMocks());

describe('database errors propagate', () => {
  // An outage must not look like "no such user" or a wrong password.
  it('from getUserByEmail', async () => {
    user.findUnique.mockRejectedValue(new Error('db down'));
    await expect(getUserByEmail('a@b.com')).rejects.toThrow('db down');
  });

  it('from verifyPassword', async () => {
    user.findUnique.mockRejectedValue(new Error('db down'));
    await expect(verifyPassword('a@b.com', 'pw')).rejects.toThrow('db down');
  });
});

describe('verifyPassword', () => {
  it('returns null for an unknown email', async () => {
    user.findUnique.mockResolvedValue(null);
    await expect(verifyPassword('nobody@b.com', 'pw')).resolves.toBeNull();
  });

  it('returns null for a wrong password', async () => {
    user.findUnique.mockResolvedValue({ id: 'u1', password: await bcrypt.hash('right', 4) });
    await expect(verifyPassword('a@b.com', 'wrong')).resolves.toBeNull();
  });

  it('returns the user for the right password', async () => {
    const found = { id: 'u1', password: await bcrypt.hash('right', 4) };
    user.findUnique.mockResolvedValue(found);
    await expect(verifyPassword('A@B.com', 'right')).resolves.toBe(found);
    expect(user.findUnique).toHaveBeenCalledWith({ where: { email: 'a@b.com' } });
  });
});

describe('createUser', () => {
  it('throws UserExistsError when the email is already registered', async () => {
    user.findUnique.mockResolvedValue({ id: 'u1' });
    await expect(createUser('a@b.com', 'password1', 'A')).rejects.toBeInstanceOf(UserExistsError);
    expect(user.create).not.toHaveBeenCalled();
  });

  it('throws UserExistsError when a concurrent signup wins the race', async () => {
    user.findUnique.mockResolvedValue(null);
    user.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
        meta: { target: ['email'] },
      })
    );
    await expect(createUser('a@b.com', 'password1', 'A')).rejects.toBeInstanceOf(UserExistsError);
  });

  it('propagates other database errors', async () => {
    user.findUnique.mockResolvedValue(null);
    user.create.mockRejectedValue(new Error('db down'));
    await expect(createUser('a@b.com', 'password1', 'A')).rejects.toThrow('db down');
  });
});
