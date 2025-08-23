import QRCode from 'qrcode';
import { uploadImage } from './cloudinary';

export async function generateQrCodeAndUpload(link) {
  // Generate QR code buffer
  const qrBuffer = await QRCode.toBuffer(link);

  // Convert Buffer to Blob-like object that has arrayBuffer()
  const blobLike = {
    arrayBuffer: async () => qrBuffer.buffer.slice(qrBuffer.byteOffset, qrBuffer.byteOffset + qrBuffer.byteLength),
    size: qrBuffer.length,
    type: 'image/png',
    name: 'qr-code.png',
  };

  // Upload image to Cloudinary using your helper
  const imageUrl = await uploadImage
  (blobLike);
  return imageUrl;
}
