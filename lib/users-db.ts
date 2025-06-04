import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { User } from '@/types';

// Get user by email
export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    return user;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
};

// Get user by ID
export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
};

// Create new user
export const createUser = async (email: string, password: string, name: string): Promise<User> => {
  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        password: hashedPassword,
        role: 'user',
      },
    });

    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Verify user password
export const verifyPassword = async (email: string, password: string): Promise<User | null> => {
  try {
    const user = await getUserByEmail(email);

    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  } catch (error) {
    console.error('Error verifying password:', error);
    return null;
  }
};

// Update user
export const updateUser = async (
  id: string,
  data: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<User | null> => {
  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...data,
        // Hash password if being updated
        ...(data.password && { password: await bcrypt.hash(data.password, 12) }),
      },
    });
    return user;
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
};

// Get all users (admin only)
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
};
