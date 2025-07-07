import { JwtPayload } from "jsonwebtoken";
import { Chat2Model, IChat2 } from "./chat2.interface";
import { Chat2 } from "./chat2.model";
import { IMessage } from "../message/message.interface";
import { Message } from "../message/message.model";

// ---------- create message ----------
const createChat2IntoDB = async (payload: any): Promise<IChat2> => {
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
const getChat2FromDB = async (
  user: JwtPayload,
  searchTerm: string | null | undefined
): Promise<IChat2[]> => {
  const chats = await Chat2.find({ participants: { $in: [user.id] } })
    .populate({
      path: "participants",
      select: "name profile email role",
      match: {
        _id: { $ne: user.id }, // Exclude user.id in the populated participants
        ...(searchTerm && { name: { $regex: searchTerm, $options: "i" } }), // Apply $regex only if search is valid
      },
    })
    .select("participants isDeleted")
    .sort({ updatedAt: -1 }); // sort by updatedAt in descending order

  // Filter out chats where no participants match the search (empty participants)
  const filteredChats = chats?.filter(
    (chat: any) => chat?.participants?.length > 0
  );

  const chatList = await Promise.all(
    filteredChats?.map(async (chat: any) => {
      const data = chat?.toObject();

      const lastMessage: IMessage | null = await Message.findOne({
        chatId: chat?._id,
      })
        .sort({ createdAt: -1 })
        .select("text offer createdAt sender");

      return {
        ...data,
        participants: data.participants[0],
        lastMessage: lastMessage || null,
      };
    })
  );

  return chatList;
};

export const Chat2Services = { createChat2IntoDB, getChat2FromDB };
