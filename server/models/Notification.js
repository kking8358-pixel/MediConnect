import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['reminder', 'appointment', 'system', 'emergency'],
      default: 'system'
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    refId: { type: String },
    read: { type: Boolean, default: false },
    createdAt: { type: String, default: () => new Date().toISOString() }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

export const NotificationModel = mongoose.model('Notification', NotificationSchema);
