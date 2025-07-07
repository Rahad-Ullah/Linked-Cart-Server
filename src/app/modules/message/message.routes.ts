import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { MessageController } from './message.controller';
import fileUploadHandler from '../../middlewares/fileUploaderHandler';

const router = express.Router();

router.post(
  '/',
  fileUploadHandler(),
  auth(USER_ROLES.CUSTOMER, USER_ROLES.SHOPPER, USER_ROLES.SHOP),
  MessageController.sendMessage
);
router.get(
  '/:id',
  auth(USER_ROLES.CUSTOMER, USER_ROLES.SHOPPER,USER_ROLES.SHOP),
  MessageController.getMessage
);

export const MessageRoutes = router;
