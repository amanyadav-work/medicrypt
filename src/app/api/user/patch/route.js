import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import User from '@/models/User';
import { sendErrorResponse } from '@/lib/sendErrorResponse';
import { uploadImage } from '@/lib/cloudinary';
import bcrypt from 'bcrypt';

export async function PATCH(req) {
  try {
    await dbConnect();
    const formData = await req.formData();
    const userId = formData.get('userId');
    if (!userId) {
      return sendErrorResponse({ code: 'missing_user', message: 'User ID required', status: 400 });
    }
    const name = formData.get('name');
    const age = formData.get('age');
    const avatarFile = formData.get('avatar');
    const password = formData.get('password');
    const faceDescriptor = formData.get('faceDescriptor');

    const update = {};
    if (name) update.name = name;
    if (age) update.age = age;
    if (avatarFile) update.avatar = await uploadImage(avatarFile);
    if (password) update.password = await bcrypt.hash(password, 10);
    if (faceDescriptor) {
      try {
        const parsedDescriptor = JSON.parse(faceDescriptor);
        if (!Array.isArray(parsedDescriptor) || parsedDescriptor.length !== 128) {
          return sendErrorResponse({ code: 'invalid_descriptor', message: 'Invalid face descriptor', status: 400 });
        }
        update.faceDescriptor = parsedDescriptor;
      } catch (err) {
        return sendErrorResponse({ code: 'bad_descriptor', message: 'Malformed face descriptor', status: 400 });
      }
    }
    const user = await User.findByIdAndUpdate(userId, update, { new: true });
    if (!user) {
      return sendErrorResponse({ code: 'not_found', message: 'User not found', status: 404 });
    }
    const { password: _, ...userData } = user.toObject();
    return NextResponse.json({ message: 'User updated', user: userData }, { status: 200 });
  } catch (error) {
    console.error('Patch user error:', error);
    return sendErrorResponse({ code: 'server_error', message: 'Server error', status: 500 });
  }
}
