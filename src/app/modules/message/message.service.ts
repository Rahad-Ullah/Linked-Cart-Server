import { JwtPayload } from 'jsonwebtoken';
import QueryBuilder from '../../builder/queryBuilder';
import { IMessage } from './message.interface';
import { Message } from './message.model';
import { Chat } from '../chat/chat.model';

// ---------- send message ----------
const sendMessageToDB = async (payload: Partial<IMessage>): Promise<IMessage> => {
  // check if chat exist or not
  const chat = await Chat.findById(payload.chatId);
  if (!chat) throw new Error('Chat not found');
  if(!payload.text && !payload.image) throw new Error('Text or Image is required');

  const response = await Message.create(payload);

  // emit socket event
  //@ts-ignore
  const io = global.io;
  if (io) {
    io.emit(`getMessage::${payload?.chatId}`, response);
  }

  await Chat.findOneAndUpdate({_id:payload.chatId},{})
  return response;
};

// ---------- get chat messages ----------
const getMessageFromDB = async (id: any,query:Record<string,any>,user:JwtPayload) => {
  // seen  all message
  const seenAllMessage = await Message.updateMany(
    { chatId: id, seenBy: { $nin: [user?.id] } },
    { $push: { seenBy: user?.id } }
  );

  // get chat
  const chat = await Chat.findById(id);
  if (!chat) throw new Error("Chat not found");
  // get another participant
  const anotherParticipant = chat.participants.filter(
    (participant) => participant.toString() !== user?.id
  )[0];

  // get messages
  const MessageQuery = new QueryBuilder(
    Message.find({ chatId: id }),
    query
  ).paginate();
  const [messages, pagination] = await Promise.all([
    MessageQuery.modelQuery.lean(),
    MessageQuery.getPaginationInfo(),
  ]);

  return {
    pagination,
    messages: messages.map((message: any) => {
      return {
        ...message,
        seen: message.seenBy
          .map((id: string) => id.toString())
          .includes(anotherParticipant.toString()),
      };
    }),
  };
};

export const MessageService = { sendMessageToDB, getMessageFromDB };
