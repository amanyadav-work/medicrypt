import { NextResponse } from 'next/server';
import User from '@/models/User'; // default export, not destructured
import bcrypt from 'bcrypt';
import { dbConnect } from '@/lib/mongoose';
import jwt from 'jsonwebtoken';
import { sendErrorResponse } from '@/lib/sendErrorResponse';

const JWT_SECRET = process.env.JWT_SECRET; // Must be set in your .env

export async function POST(req) {
  try {
   const { email, password, role } = await req.json();

    if (!email || !password || !role) {
      return sendErrorResponse({ code: 'missing_fields', message: 'Missing email, password, or role', status: 400 });
    }
    await dbConnect();

    const user = await User.findOne({ email });
    if (!user) {
      return sendErrorResponse({ code: 'user_not_found', message: 'User not found', status: 404 });
    }

    if (user.role !== role) {
      return sendErrorResponse({ code: 'invalid_role', message: 'User role does not match', status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendErrorResponse({ code: 'invalid_credentials', message: 'Invalid credentials', status: 401 });
    }

    // Create JWT with user ID and email
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Exclude password from user data
    const { password: _, ...userData } = user.toObject();

    const response = NextResponse.json(
      { message: 'Login successful', user: userData },
      { status: 200 }
    );

    // Set cookie
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return sendErrorResponse({ code: 'server_error', message: 'Server error', status: 500 });
  }
}