import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import User from '@/models/User'; // fix import (no destructuring)
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendErrorResponse } from '@/lib/sendErrorResponse';
import { uploadImage } from '@/lib/cloudinary';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  try {
    const formData = await req.formData();
    const email = formData.get('email');
    const password = formData.get('password');
    const name = formData.get('name');
    const age = formData.get('age');
    const avatarFile = formData.get('avatar');
    const role = formData.get('role');
    const faceDescriptor = formData.get('faceDescriptor');

    if (!email || !password || !name || !age || !avatarFile || !role || !faceDescriptor) {
      return sendErrorResponse({ code: 'missing_fields', message: 'All fields are required', status: 400 });
    }

    const avatar = await uploadImage(avatarFile);

    await dbConnect();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendErrorResponse({ code: 'user_exists', message: 'User already exists', status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let parsedDescriptor;
    try {
      parsedDescriptor = JSON.parse(faceDescriptor);
      if (!Array.isArray(parsedDescriptor) || parsedDescriptor.length !== 128) {
        return sendErrorResponse({ code: 'invalid_descriptor', message: 'Invalid face descriptor', status: 400 });
      }
    } catch (err) {
      return sendErrorResponse({ code: 'bad_descriptor', message: 'Malformed face descriptor', status: 400 });
    }


    const newUser = await User.create({
      email,
      password: hashedPassword,
      name,
      age,
      avatar,
      role,
      faceDescriptor: parsedDescriptor,
    });

    const token = jwt.sign(
      { userId: newUser._id.toString(), email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userData } = newUser.toObject();

    const response = NextResponse.json(
      { message: 'Signup successful', user: userData },
      { status: 201 }
    );

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return sendErrorResponse({ code: 'server_error', message: 'Server error', status: 500 });
  }
}