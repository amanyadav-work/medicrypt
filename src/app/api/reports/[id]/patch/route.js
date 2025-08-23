import { NextResponse } from 'next/server';
import { uploadImage, uploadPDF } from '@/lib/cloudinary';
import { verifyToken } from '@/lib/verifyToken';
import { dbConnect } from '@/lib/mongoose';
import Report from '@/models/Report';
import AuditLog from '@/models/AuditLog';

export async function PATCH(req, { params }) {
  try {
    await dbConnect();
    const payload = await verifyToken(req);
    if (!payload) {
      return NextResponse.json({ error: 'Please Login First' }, { status: 401 });
    }

    const userID = payload.userId;
    const { id } = params;
    const formData = await req.formData();

    // Find report
    const report = await Report.findById(id);
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }
    if (String(report.owner) !== String(userID)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Editable fields
    const title = formData.get('name');
    const description = formData.get('desc');
    const type = formData.get('type');
    const file = formData.get('file');

    // Update fields if provided
    if (title) report.title = title;
    if (description) report.description = description;
    if (type) report.type = type;

    // If file is provided, upload and update
    if (file) {
      let publicIdOrUrl;
      if (type === 'image') {
        publicIdOrUrl = await uploadImage(file);
        report.url = publicIdOrUrl;
        report.publicId = undefined;
      } else if (type === 'pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = `data:application/pdf;base64,${buffer.toString('base64')}`;
        const ext = 'pdf';
        publicIdOrUrl = await uploadPDF(base64, userID, ext);
        report.publicId = publicIdOrUrl;
        report.url = undefined;
      } else {
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
      }
    }

    await report.save();

    // Audit log
    await AuditLog.create({
      user: userID,
      action: 'edit',
      resource: `report:${report._id}`,
    });

    return NextResponse.json({ id: report._id });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Edit failed' }, { status: 500 });
  }
}
