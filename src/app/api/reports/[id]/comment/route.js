import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import Comment from '@/models/Comment';
import Report from '@/models/Report';
import { verifyToken } from '@/lib/verifyToken';

export async function POST(req, { params }) {
  try {
    await dbConnect();
    const payload = await verifyToken(req);
    if (!payload) {
      return NextResponse.json({ error: 'Please Login First' }, { status: 401 });
    }
    const { id } = params;
    let text;
    // Accept JSON body only (no file upload)
    if (req.headers.get('content-type')?.includes('application/json')) {
      const body = await req.json();
      text = body.text;
    } else {
      // fallback for formData (if needed)
      const formData = await req.formData();
      text = formData.get('text');
    }
    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Comment text required' }, { status: 400 });
    }
    // Create comment (no image)
    const comment = await Comment.create({
      report: id,
      user: payload.userId,
      text,
    });
    // Add comment to report
    await Report.findByIdAndUpdate(id, { $push: { comments: comment._id } });
    return NextResponse.json({ success: true, comment });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to add comment' }, { status: 500 });
  }
}
