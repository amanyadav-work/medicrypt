import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import OtpShare from '@/models/OtpShare';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    await dbConnect();
    const { token, otp } = await req.json();
    if (!token || !otp) {
      return NextResponse.json({ error: 'Token and OTP required' }, { status: 400 });
    }
    // Validate token and OTP from JWT
    const JWT_SECRET = process.env.JWT_SECRET;
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: 'Token expired or invalid' }, { status: 401 });
    }
    if (payload.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 });
    }

    // After OTP is validated, fetch report and perform actions
    const reportId = payload.reportId;
    if (!reportId) {
      return NextResponse.json({ error: 'Report ID missing in token' }, { status: 400 });
    }

    // Fetch report
    const Report = (await import('@/models/Report')).default;
    const AuditLog = (await import('@/models/AuditLog')).default;
    const { v2: cloudinary } = await import('cloudinary');

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const report = await Report.findById(reportId)
      .populate({ path: 'owner', select: 'name email avatar' })
      .lean();

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Generate signed URL if it's a PDF
    let signedUrl = null;
    if (report.type === 'pdf' && report.publicId) {
      signedUrl = cloudinary.utils.private_download_url(
        report.publicId,
        'pdf',
        {
          resource_type: 'raw',
          type: 'authenticated',
          expires_at: Math.floor(Date.now() / 1000) + 60 // 1 minute expiry
        }
      );
    }

    // Increment views
    await Report.findByIdAndUpdate(reportId, { $inc: { views: 1 } });

    // Audit log: view
    await AuditLog.create({
    //   user: payload.userId,
      action: 'view',
      resource: `report:${reportId}`,
    });

    // Return full report + signed URL (if needed)
    return NextResponse.json({
      ...report,
      url: signedUrl || report.url || null,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to validate OTP' }, { status: 500 });
  }
}
