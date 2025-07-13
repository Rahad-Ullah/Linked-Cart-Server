import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { Chat2 } from "../chat2/chat2.model";
import { IMessage2, Message2Model } from "./message2.interface";
import { Message2 } from "./message2.model";

// ------------ create message -------------
const createMessageIntoDB = async (payload: Partial<IMessage2>) => {
  const chat = await Chat2.findById(payload.chat);
  if (!chat) throw new ApiError(StatusCodes.CONFLICT, "Chat not found");
  if (!payload.text && !payload.image)
    throw new ApiError(StatusCodes.CONFLICT, "Text or Image is required");

  const result = await Message2.create(payload);

  // emit socket event
  // @ts-ignore
  const io = global.io;
  if (io) {
    io.emit(`getMessage::${payload?.chat}`, result);
  }

  // update chat to set it to the top
  await Chat2.findOneAndUpdate({ _id: payload.chat }, {});
};

export const Message2Services = { createMessageIntoDB };
