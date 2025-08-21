import { NextResponse } from 'next/server';
import User from '@/models/User';
import { verifyToken } from '@/lib/verifyToken';
import { dbConnect } from '@/lib/mongoose';
import { sendErrorResponse } from '@/lib/sendErrorResponse'; // import your helper

export async function GET(req) {
  await dbConnect();

  const payload = await verifyToken(req);

  if (!payload) {
    return sendErrorResponse({ code: 'unauthorized', message: 'Please Login First', status: 401 });
  }

  const userID = payload.userId;

  // Fetch user by ID, exclude password
  const user = await User.findById(userID).select('-password').lean();

  if (!user) {
    return sendErrorResponse({ code: 'user_not_found', message: 'User not found', status: 404 });
  }

  // Return user data as JSON response
  return NextResponse.json(user, { status: 200 });
}