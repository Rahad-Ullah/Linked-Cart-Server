import express from "express";
import { Chat2Controller } from "./chat2.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

const router = express.Router();

router.post("/:id", auth(USER_ROLES.CUSTOMER), Chat2Controller.createChat);

router.get("/", auth(USER_ROLES.CUSTOMER), Chat2Controller.getChats);

export const Chat2Routes = router;
