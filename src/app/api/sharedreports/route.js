import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import SharedReport from '@/models/SharedReport';
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
    // Find all shared reports for this user
  const sharedReports = await SharedReport.find({ sharedWith: { $in: [userID] } })
      .populate({
        path: 'report',
        populate: { path: 'owner', select: 'name email avatar' },
      })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ sharedReports });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to fetch shared reports' }, { status: 500 });
  }
}
