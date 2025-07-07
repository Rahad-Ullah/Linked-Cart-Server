import { Chat2Model, IChat2 } from "./chat2.interface";
import { Chat2 } from "./chat2.model";

// ---------- create message ----------
export const createChat2IntoDB = async (payload: any): Promise<IChat2> => {
  // check if chat already exists
  const isExistChat = await Chat2.findOne({
    participants: { $all: payload },
  });
  if (isExistChat) {
    return isExistChat;
  }
  // create new chat
  const result = await Chat2.create({ participants: payload });
  return result;
};

// ---------- get chat ----------

export const Chat2Services = { createChat2IntoDB };
