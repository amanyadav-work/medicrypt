import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import Report from '@/models/Report';
import { verifyToken } from '@/lib/verifyToken';
import AuditLog from '@/models/AuditLog';

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const payload = await verifyToken(req);
    if (!payload) {
      return NextResponse.json({ error: 'Please Login First' }, { status: 401 });
    }
  const { id } = await params;
    // Find report and populate owner and comments
    const report = await Report.findById(id)
      .populate({
        path: 'owner',
        select: 'name email avatar',
      })
      .lean();
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }
    // Increment views
    await Report.findByIdAndUpdate(id, { $inc: { views: 1 } });

    // Audit log: view
    await AuditLog.create({
      user: payload.userId,
      action: 'view',
      resource: `report:${id}`,
    });

    return NextResponse.json({
      ...report
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to fetch report' }, { status: 500 });
  }
}
