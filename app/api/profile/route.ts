import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { validatePassword } from '@/lib/password-policy';
import { isUniqueViolation } from '@/lib/prisma-errors';
import { RATE_LIMITS, rateLimit, tooManyRequests } from '@/lib/rate-limit';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    const { name, email, currentPassword, newPassword } = body ?? {};

    if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json({ error: 'Please provide a valid email address' }, { status: 400 });
    }
    if (name !== undefined && name !== null && typeof name !== 'string') {
      return NextResponse.json({ error: 'Name must be a string' }, { status: 400 });
    }
    if (newPassword !== undefined && newPassword !== null && typeof newPassword !== 'string') {
      return NextResponse.json({ error: 'New password must be a string' }, { status: 400 });
    }
    if (
      currentPassword !== undefined &&
      currentPassword !== null &&
      typeof currentPassword !== 'string'
    ) {
      return NextResponse.json({ error: 'Current password must be a string' }, { status: 400 });
    }
    const normalizedEmail = email.trim().toLowerCase();

    // Get current user data
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, password: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: {
      name: string | null;
      email: string;
      updatedAt: Date;
      password?: string;
    } = {
      name: (typeof name === 'string' && name.trim()) || null,
      email: normalizedEmail,
      updatedAt: new Date(),
    };

    // If email is being changed, check it's not taken
    if (normalizedEmail !== currentUser.email.toLowerCase()) {
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
      }
    }

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required' }, { status: 400 });
      }

      const limited = await rateLimit(
        `password-change:${session.user.id}`,
        RATE_LIMITS.passwordChange
      );
      if (!limited.allowed) {
        return tooManyRequests(
          limited,
          'Too many password change attempts. Please try again later.'
        );
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentUser.password);
      if (!isCurrentPasswordValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      const passwordError = validatePassword(newPassword);
      if (passwordError) {
        return NextResponse.json({ error: passwordError }, { status: 400 });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      updateData.password = hashedPassword;
    }

    // The availability check above can race a concurrent signup or email change; the
    // unique index is the real guard.
    let updatedUser;
    try {
      updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      if (isUniqueViolation(error, 'email')) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
