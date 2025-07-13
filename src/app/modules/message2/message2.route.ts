import express from 'express';
import { Message2Controller } from './message2.controller';
import validateRequest from "../../middlewares/validateRequest";
import { Message2Validations } from "./message2.validation";
import fileUploadHandler from "../../middlewares/fileUploaderHandler";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

const router = express.Router();

router.post(
  "/",
  auth(USER_ROLES.CUSTOMER, USER_ROLES.SHOP),
  fileUploadHandler(),
  validateRequest(Message2Validations.createMessageSchema),
  Message2Controller.createMessage
); 

export const Message2Routes = router;
