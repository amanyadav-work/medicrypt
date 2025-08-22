import mongoose, { Schema } from 'mongoose';

const CommentSchema = new Schema({
  report: {
    type: Schema.Types.ObjectId,
    ref: 'Report',
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema);
