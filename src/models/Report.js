import mongoose, { Schema } from 'mongoose';

const ReportSchema = new Schema({
  sharableUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: "",
  },
  publicId: { // ⬅️ new field
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['pdf', 'image'],
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  comments: [{
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Report || mongoose.model('Report', ReportSchema);
