import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import Report from '@/models/Report';
import SharedReport from '@/models/SharedReport';
import User from '@/models/User';
import { sendErrorResponse } from '@/lib/sendErrorResponse';

export async function POST(req, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const { email } = await req.json();
    if (!email) {
      return sendErrorResponse({ code: 'EMAIL_REQUIRED', message: 'Email is required', status: 400 });
    }
    // Find user by email
    const userToShare = await User.findOne({ email });
    if (!userToShare) {
      return sendErrorResponse({ code: 'USER_NOT_FOUND', message: 'User not found', status: 404 });
    }
    // Add user to sharableUsers array if not already present
    const report = await Report.findById(id);
    if (!report) {
      return sendErrorResponse({ code: 'REPORT_NOT_FOUND', message: 'Report not found', status: 404 });
    }
    // Prevent sharing to self
    if (String(report.owner) === String(userToShare._id)) {
      return sendErrorResponse({ code: 'SHARE_TO_SELF', message: 'You cannot share the report with yourself', status: 400 });
    }
    if (!report.sharableUsers) report.sharableUsers = [];
    if (report.sharableUsers.some(u => String(u) === String(userToShare._id))) {
      return sendErrorResponse({ code: 'ALREADY_SHARED', message: 'Report already shared with this user', status: 400 });
    }
    
await Report.updateOne(
  { _id: report._id },
  { $addToSet: { sharableUsers: userToShare._id } }
);


    // Create or update SharedReport document for listing
    let sharedReport = await SharedReport.findOne({ report: report._id });
    if (sharedReport) {
      // Add user to sharedWith if not already present
      if (!sharedReport.sharedWith.some(u => String(u) === String(userToShare._id))) {
        sharedReport.sharedWith.push(userToShare._id);
        await sharedReport.save();
      }
    } else {
      await SharedReport.create({
        report: report._id,
        sharedWith: [userToShare._id],
        sharedBy: report.owner,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return sendErrorResponse({ code: 'SHARE_ERROR', message: err.message || 'Failed to share report', status: 500 });
  }
}
