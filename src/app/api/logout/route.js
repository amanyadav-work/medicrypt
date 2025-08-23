import { NextResponse } from 'next/server';

export async function POST() {
  // Clear the 'token' cookie by setting it with an expired date
  const response = NextResponse.json({ message: 'Logged out' });

  response.cookies.set('token', '', {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    expires: new Date(0), // Set expiry to the past to delete cookie
  });

  return response;
}
