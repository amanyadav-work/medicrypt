
import { NextResponse } from 'next/server';

export function sendErrorResponse({ code, message, status = 400 }) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
      },
    },
    { status }
  );
}