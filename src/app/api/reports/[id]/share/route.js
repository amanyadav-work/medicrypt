import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import Report from '@/models/Report';
import SharedReport from '@/models/SharedReport';
import User from '@/models/User';
import { sendErrorResponse } from '@/lib/sendErrorResponse';
import OtpShare from '@/models/OtpShare';
import { sendWhatsapp } from '@/lib/twilio';
import { verifyToken } from '@/lib/verifyToken';

export async function POST(req, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    const body = await req.json();
    const { email, phone, accessType } = body;
    let userToShare;
    const report = await Report.findById(id);
    const payload = await verifyToken(req);
  
    if (!payload) {
      return sendErrorResponse({ code: 'unauthorized', message: 'Please Login First', status: 401 });
    }
  
    const userID = payload.userId;
    if (!report) {
      return sendErrorResponse({ code: 'REPORT_NOT_FOUND', message: 'Report not found', status: 404 });
    }

    if (accessType === 'face') {
      if (!email) {
        return sendErrorResponse({ code: 'EMAIL_REQUIRED', message: 'Email is required', status: 400 });
      }
      userToShare = await User.findOne({ email });
      if (!userToShare) {
        return sendErrorResponse({ code: 'USER_NOT_FOUND', message: 'User not found', status: 404 });
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
          accessType: accessType || 'face',
        });
      }
    }

    // OTP logic: generate token, OTP, store, and send WhatsApp (no user required)
    if (accessType === 'otp') {
      if (!phone) {
        return sendErrorResponse({ code: 'PHONE_REQUIRED', message: 'Phone is required', status: 400 });
      }
      const jwt = require('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET;
      // Generate random 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const token = jwt.sign({
        reportId: report._id,
        type: 'otp',
        otp,
      }, JWT_SECRET, { expiresIn: '30m' });
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
      await OtpShare.create({
        report: report._id,
        token,
        otp,
       expiresAt, ...(userID && { user: userID }) 
      });
      // Send WhatsApp message with OTP and link
      try {
        const link = `${process.env.FRONT_END_URL}/otp-access?token=${encodeURIComponent(token)}`;
        const message = `Your OTP for report access is: ${otp}\nAccess link: ${link}`;
        await sendWhatsapp({ phone, message });
      } catch (err) {
        // Log but don't fail sharing if WhatsApp fails
        console.error('WhatsApp send error:', err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return sendErrorResponse({ code: 'SHARE_ERROR', message: err.message || 'Failed to share report', status: 500 });
  }
}
