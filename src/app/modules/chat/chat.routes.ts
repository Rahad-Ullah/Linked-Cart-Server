import express from 'express';
import auth from '../../middlewares/auth';
import { ChatController } from './chat.controller';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from "../../middlewares/validateRequest";
import { chatValidation } from "./chat.validation";
const router = express.Router();

router.post(
  "/:id",
  validateRequest(chatValidation.createChatSchema),
  auth(USER_ROLES.CUSTOMER),
  ChatController.createChat
);
router.get(
  '/',
  auth(USER_ROLES.CUSTOMER),
  ChatController.getChat
);

export const ChatRoutes = router;
