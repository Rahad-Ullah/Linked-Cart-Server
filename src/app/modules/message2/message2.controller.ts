import { Request, Response, NextFunction } from 'express';
import { Message2Services } from './message2.service';
import catchAsync from "../../../shared/catchAsync";
import { getSingleFilePath } from "../../../shared/getFilePath";

// create message
const createMessage = catchAsync(async (req: Request, res: Response) => {
  const image = getSingleFilePath(req.files, "image");

  const payload = {
    ...req.body,
    image,
    sender: req.user?.id,
  };

  const result = await Message2Services.createMessageIntoDB(payload);

  res.status(200).json({
    success: true,
    message: "Message created successfully",
    data: result,
  });
});

export const Message2Controller = { createMessage };