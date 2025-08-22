import { NextResponse } from 'next/server';
import { uploadImage, uploadPDF } from '@/lib/cloudinary';
import { verifyToken } from '@/lib/verifyToken';
import { dbConnect } from '@/lib/mongoose';
import Report from '@/models/Report';
import AuditLog from '@/models/AuditLog';

export async function POST(req) {
  try {
    await dbConnect();
    const payload = await verifyToken(req);
    if (!payload) {
      return NextResponse.json({ error: 'Please Login First' }, { status: 401 });
    }

    const userID = payload.userId;
    const formData = await req.formData();

    const file = formData.get('file');
    const type = formData.get('type');
    const title = formData.get('name');
    const description = formData.get('desc');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    let publicIdOrUrl;

    if (type === 'image') {
      // Upload public image and get secure URL
      publicIdOrUrl = await uploadImage(file);
    } else if (type === 'pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = `data:application/pdf;base64,${buffer.toString('base64')}`;
      const ext = 'pdf';

      // Upload as authenticated and get publicId
      publicIdOrUrl = await uploadPDF(base64, userID, ext); // This should return the `publicId`
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    // Save report to DB
    const report = await Report.create({
      type,
      title,
      description,
      owner: userID,
      // Store either `url` (image) or `publicId` (pdf)
      ...(type === 'pdf' ? { publicId: publicIdOrUrl } : { url: publicIdOrUrl }),
    });

    // Audit log
    await AuditLog.create({
      user: userID,
      action: 'create',
      resource: `report:${report._id}`,
    });

    return NextResponse.json({ id: report._id });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
