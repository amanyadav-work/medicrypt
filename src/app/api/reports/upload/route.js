import { NextResponse } from 'next/server';
import { uploadImage, uploadModelGLB } from '@/lib/cloudinary';
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
        let url;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (type === 'image') {
            url = await uploadImage(file);
        } else if (type === 'pdf') {
            // Convert file to base64 for Cloudinary raw upload
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64 = `data:application/pdf;base64,${buffer.toString('base64')}`;
            // Get file extension (default to pdf)
            const ext = 'pdf';
            url = await import('@/lib/cloudinary').then(mod => mod.uploadPDF(base64, userID, ext));
        } else {
            return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
        }

        // Add report entry to DB
        const report = await Report.create({
            url,
            type,
            owner: userID,
            title,
            description,
        });

        // Audit log: create
        await AuditLog.create({
            user: userID,
            action: 'create',
            resource: `report:${report._id}`,
        });

        return NextResponse.json({ url, id: report._id });
    } catch (err) {
        return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
    }
}
