import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import Comment from '@/models/Comment';
import User from '@/models/User';

export async function GET(req, { params }) {
  try {
    await dbConnect();
  const { id } = await params;
    // Find all comments for the report and populate user info
    const comments = await Comment.find({ report: id })
      .populate({
        path: 'user',
        select: 'name email avatar role age',
      })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ comments });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to fetch comments' }, { status: 500 });
  }
}
