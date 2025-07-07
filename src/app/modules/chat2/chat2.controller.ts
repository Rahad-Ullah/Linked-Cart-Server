import { Request, Response, NextFunction } from "express";
import { Chat2Services } from "./chat2.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";

// ---------- create chat ----------
const createChat = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const otherUser = req.params.id;
  const participants = [user?.id, otherUser];

  const result = await Chat2Services.createChat2IntoDB(participants);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Chat created successfully",
    data: result,
  });
});

// ---------- get chats ----------
const getChats = catchAsync(async(req: Request, res: Response) => {
  const user = req.user;
  const searchTerm = req.query.searchTerm;
  const result = await Chat2Services.getChat2FromDB(user, searchTerm as string | null | undefined);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Chats fetched successfully",
    data: result,
  })
})

export const Chat2Controller = { createChat, getChats };
