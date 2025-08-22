import mongoose, { Schema } from 'mongoose';

const SharedReportSchema = new Schema({
  report: {
    type: Schema.Types.ObjectId,
    ref: 'Report',
    required: true,
  },
  sharedWith: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  sharedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.SharedReport || mongoose.model('SharedReport', SharedReportSchema);
