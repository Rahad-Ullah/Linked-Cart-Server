import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { NotificationController } from './notification.controller';
const router = express.Router();

router.route("/")
    .get(
        auth(),
        NotificationController.getNotificationFromDB
    )
    .patch(
        auth(),
        NotificationController.readNotification
    )

export const NotificationRoutes = router;