import { Model, ObjectId } from "mongoose";

export type IMessage2 = {
  chat: ObjectId;
  sender: ObjectId;
  text?: string;
  image?: string;
  seenBy?: ObjectId[];
  seen?: boolean;
};

export type Message2Model = Model<IMessage2>;
