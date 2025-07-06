import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { MessageService } from './message.service';
import { getSingleFilePath } from '../../../shared/getFilePath';

const sendMessage = catchAsync(async (req: Request, res: Response) => {
  const user = req.user.id;


  let image = getSingleFilePath(req.files, 'image');

  const payload = {
    ...req.body,
    image:image||'',
    sender: user,
  };

  const message = await MessageService.sendMessageToDB(payload);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Send Message Successfully',
    data: message,
  });
});

const getMessage = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const query = req.query;
  const user = req.user;
  const messages = await MessageService.getMessageFromDB(id, query,user);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Message Retrieve Successfully',
    data: messages,
  });
});

export const MessageController = { sendMessage, getMessage };
