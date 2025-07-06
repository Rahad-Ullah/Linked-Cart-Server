import express from 'express';
import { DashboardController } from './dashboard.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
const router = express.Router();
router.get('/',auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),DashboardController.getAdminDashboardData);
router.get('/analytics',auth(USER_ROLES.ADMIN,USER_ROLES.SUPER_ADMIN),DashboardController.getAnalatycsData);
export const DashboardRoutes = router;