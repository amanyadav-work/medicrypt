'use server'

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer) 
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

// export const uploadPDF = async (base64, userId, ext) => {
//   const publicId = `reports/${userId}.${ext}`;

//   const uploadRes = await cloudinary.uploader.upload(base64, {
//     resource_type: 'raw',
//     public_id: publicId,
//     overwrite: true,
//   });

//   return uploadRes.secure_url;
// };

export const uploadPDF = async (base64, userId, ext) => {
  const publicId = `reports/${userId}-${Date.now()}.${ext}`;
  const uploadRes = await cloudinary.uploader.upload(base64, {
    resource_type: 'raw',
    public_id: publicId,
    overwrite: false,
    type: 'authenticated', // 🔐 Makes it private
  });
  return uploadRes.public_id; // ⬅️ Return only the ID
};
