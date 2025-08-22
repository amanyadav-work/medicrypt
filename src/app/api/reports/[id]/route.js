import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import Report from '@/models/Report';
import { verifyToken } from '@/lib/verifyToken';
import AuditLog from '@/models/AuditLog';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const payload = await verifyToken(req);
    if (!payload) {
      return NextResponse.json({ error: 'Please Login First' }, { status: 401 });
    }

    const { id } = await params;
    const userId = payload.userId;

    // Find report and populate owner
    const report = await Report.findById(id)
      .populate({
        path: 'owner',
        select: 'name email avatar',
      })
      .lean();

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Access check: owner or in sharableUsers
    const isOwner = report.owner._id.toString() === userId;
    const isShared = report.sharableUsers?.some(id => id.toString() === userId);

    if (!isOwner && !isShared) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
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
    await Report.findByIdAndUpdate(id, { $inc: { views: 1 } });

    // Audit log: view
    await AuditLog.create({
      user: userId,
      action: 'view',
      resource: `report:${id}`,
    });
console.log(signedUrl)
    // Return full report + signed URL (if needed)
    return NextResponse.json({
      ...report,
      url: signedUrl || report.url || null,
    });

  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to fetch report' }, { status: 500 });
  }
}
