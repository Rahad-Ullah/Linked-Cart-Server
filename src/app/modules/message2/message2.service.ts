import { Chat2 } from "../chat2/chat2.model";
import { Message2Model } from "./message2.interface";

// ------------ create message -------------
const createMessageIntoDB = async (payload: any) => {
  const exitingChat = await Chat2.findById(payload.chat);
};

export const Message2Services = {};