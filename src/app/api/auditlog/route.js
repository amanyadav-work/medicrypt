import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import AuditLog from '@/models/AuditLog';
import Report from '@/models/Report';
import SharedReport from '@/models/SharedReport';
import { verifyToken } from '@/lib/verifyToken';

export async function GET(req) {
    try {
        await dbConnect();
        const payload = await verifyToken(req);
        if (!payload) {
            return NextResponse.json({ error: 'Please Login First' }, { status: 401 });
        }
        const userID = payload.userId;

        // Find all report IDs owned by user
        const ownedReports = await Report.find({ owner: userID }).select('_id title').lean();
        const ownedReportIds = ownedReports.map(r => String(r._id));

        // Find all report IDs shared with user
        const sharedReports = await SharedReport.find({ sharedWith: { $in: [userID] } }).select('report').lean();
        const sharedReportIds = sharedReports.map(r => String(r.report));

        // All relevant report IDs
        const allReportIds = [...ownedReportIds, ...sharedReportIds];

        // Find all audit logs for these resources
        const logs = await AuditLog.find({
            resource: { $in: allReportIds.map(id => `report:${id}`) }
        })
            .populate({
                path: 'user',
                select: 'name email avatar',
            })
            .sort({ createdAt: -1 })
            .lean();

        // Attach resource name (report title) to each log
        const reportTitleMap = {};
        ownedReports.forEach(r => { reportTitleMap[`report:${r._id}`] = r.title; });
        // Optionally, fetch titles for shared reports not owned
        if (sharedReportIds.length > 0) {
            const extraReports = await Report.find({ _id: { $in: sharedReportIds } }).select('_id title').lean();
            extraReports.forEach(r => { reportTitleMap[`report:${r._id}`] = r.title; });
        }

        const logsWithResourceName = logs.map(log => ({
            ...log,
            resourceName: reportTitleMap[log.resource] || '',
        }));

        return NextResponse.json({ logs: logsWithResourceName });
    } catch (err) {
        return NextResponse.json({ error: err.message || 'Failed to fetch audit logs' }, { status: 500 });
    }
}
