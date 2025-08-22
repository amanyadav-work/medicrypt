import mongoose, { Schema } from 'mongoose';

const AuditLogSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    action: {
        type: String,
        enum: ['create', 'edit', 'delete', 'view'],
        required: true,
    },
    resource: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
