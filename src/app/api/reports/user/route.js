import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import Report from '@/models/Report';
import { verifyToken } from '@/lib/verifyToken';

export async function GET(req) {
  try {
    await dbConnect();
    const payload = await verifyToken(req);
    if (!payload) {
      return NextResponse.json({ error: 'Please Login First' }, { status: 401 });
    }
    const userID = payload.userId;
    // Find all reports owned by this user
    const reports = await Report.find({ owner: userID })
      .populate('owner', 'name email avatar')
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ reports });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to fetch reports' }, { status: 500 });
  }
}
