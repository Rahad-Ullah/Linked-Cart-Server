import { JwtPayload } from 'jsonwebtoken';
import { Notification } from './notification.model';
import { FilterQuery } from 'mongoose';
import ApiError from '../../../errors/ApiErrors';
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/queryBuilder';
import { calculateDistance } from '../../../helpers/distanceCalculator';
import { timeAgo } from '../../../shared/timeAgo';

const getNotificationFromDB = async (user: JwtPayload, query: FilterQuery<any>): Promise<Object> => {
    const notificationQuery = new QueryBuilder(
        Notification.find({ receiver: user.id }),
        query
    ).paginate()

    const [notifications, pagination, unreadCount] = await Promise.all([
        notificationQuery.modelQuery.lean().exec(),
        notificationQuery.getPaginationInfo(),
        Notification.countDocuments({ receiver: user.id, read: false })
    ]);


    
    return {
        notifications:notifications.map((notification: any) => {
        
            return {
                ...notification,
                timeAgo: timeAgo(notification.createdAt),
            }
        }),
        pagination,
        unreadCount
    }
};


const readNotificationToDB = async (user: JwtPayload): Promise<boolean> => {

    const result = await Notification.bulkWrite([
        {
            updateMany: {
                filter: { receiver: user.id, read: false },
                update: { $set: { read: true } },
                upsert: false // Don't insert new docs
            }
        }
    ]);

    return true;
};

// get notifications for admin


// read notifications only for admin

export const NotificationService = {
    getNotificationFromDB,
    readNotificationToDB,
};
