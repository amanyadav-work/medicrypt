import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import AuditLog from '@/models/AuditLog';
import { verifyToken } from '@/lib/verifyToken';

export async function GET(req) {
    try {
        await dbConnect();
        // Get all audit logs, populate user info
        const payload = await verifyToken(req);

        if (!payload) {
            return sendErrorResponse({ code: 'unauthorized', message: 'Please Login First', status: 401 });
        }

        const userID = payload.userId;

        const logs = await AuditLog.find({ user: userID })
            .populate({
                path: 'user',
                select: 'name email avatar',
            })
            .sort({ createdAt: -1 })
            .lean();
        return NextResponse.json({ logs });
    } catch (err) {
        return NextResponse.json({ error: err.message || 'Failed to fetch audit logs' }, { status: 500 });
    }
}
