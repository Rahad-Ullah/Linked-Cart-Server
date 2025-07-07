import { Model, ObjectId } from "mongoose";

export type IChat2 = {
  participants: [ObjectId];
  isDeleted: Boolean;
};

export type Chat2Model = Model<IChat2>;
