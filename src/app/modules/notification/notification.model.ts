import { model, Schema } from 'mongoose';
import { INotification, NotificationModel } from './notification.interface';
import { USER_ROLES } from '../../../enums/user';

const notificationSchema = new Schema<INotification, NotificationModel>(
    {
        text: {
            type: String,
            required: true
        },
        receiver: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: false
        },
        referenceId: {
            type: String,
            required: false
        },
        screen: {
            type: String,
            required: false
        },
        read: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps: true
    }
);

// Index for fetching a user's notifications
notificationSchema.index({ receiver: 1, createdAt: -1 });

// Index for counting unread notifications for a user
notificationSchema.index({ receiver: 1, read: 1 });

// Index for filtering by type (e.g., ADMIN)
notificationSchema.index({ type: 1 });

export const Notification = model<INotification, NotificationModel>('Notification', notificationSchema);