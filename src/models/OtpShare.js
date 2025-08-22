import mongoose, { Schema } from 'mongoose';

const OtpShareSchema = new Schema({
  report: {
    type: Schema.Types.ObjectId,
    ref: 'Report',
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Optional for public OTP
  },
  token: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.OtpShare || mongoose.model('OtpShare', OtpShareSchema);
