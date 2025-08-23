import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    await dbConnect();

    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: 'Token expired or invalid' }, { status: 401 });
    }

    if (payload.type !== 'qr') {
      return NextResponse.json({ error: 'Invalid token type' }, { status: 401 });
    }

    const reportId = payload.reportId;
    if (!reportId) {
      return NextResponse.json({ error: 'Report ID missing in token' }, { status: 400 });
    }

    // Import models dynamically
    const Report = (await import('@/models/Report')).default;
    const AuditLog = (await import('@/models/AuditLog')).default;
    const { v2: cloudinary } = await import('cloudinary');

    // Configure cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Fetch report and populate owner
    const report = await Report.findById(reportId)
      .populate({ path: 'owner', select: 'name email avatar' })
      .lean();

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Generate signed URL if report is PDF and has publicId
    let signedUrl = null;
    if (report.type === 'pdf' && report.publicId) {
      signedUrl = cloudinary.utils.private_download_url(
        report.publicId,
        'pdf',
        {
          resource_type: 'raw',
          type: 'authenticated',
          expires_at: Math.floor(Date.now() / 1000) + 60, // 1 minute expiry
        }
      );
    }

    // Increment views count
    await Report.findByIdAndUpdate(reportId, { $inc: { views: 1 } });

    // Create audit log entry for viewing the report
    await AuditLog.create({
      action: 'view',
      resource: `report:${reportId}`,
      // Optionally add user info if available: user: payload.userId
    });

    // Return the report data plus signed URL
    return NextResponse.json({
      ...report,
      url: signedUrl || report.url || null,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to validate token' }, { status: 500 });
  }
}
