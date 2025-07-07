import { Schema, Types, ObjectId, model } from "mongoose";
import { IChat2, Chat2Model } from "./chat2.interface";

const chat2Schema = new Schema<IChat2, Chat2Model>(
  {
    participants: [{ type: Types.ObjectId, ref: "User" }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Chat2 = model<IChat2, Chat2Model>("Chat2", chat2Schema);
