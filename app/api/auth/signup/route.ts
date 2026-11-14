import { NextRequest, NextResponse } from 'next/server';
import { createUser, UserExistsError } from '@/lib/users-db';
import { validatePassword } from '@/lib/password-policy';
import { RATE_LIMITS, clientIp, rateLimit, tooManyRequests } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const limited = await rateLimit(`signup:${clientIp(request.headers)}`, RATE_LIMITS.signup);
    if (!limited.allowed) {
      return tooManyRequests(limited, 'Too many signup attempts. Please try again later.');
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    const { email, password, name } = body ?? {};

    // Validate input
    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      typeof name !== 'string' ||
      !email.trim() ||
      !password ||
      !name.trim()
    ) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Please provide a valid email address' }, { status: 400 });
    }

    // Create user
    const user = await createUser(email.trim(), password, name.trim());

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof UserExistsError) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
