import { Schema, Types, model } from "mongoose";
import { IMessage2, Message2Model } from "./message2.interface";

const message2Schema = new Schema<IMessage2, Message2Model>(
  {
    chat: {
      type: Types.ObjectId,
      required: true,
      ref: "Chat2",
    },
    sender: {
      type: Types.ObjectId,
      required: true,
      ref: "User",
    },
    text: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      required: false,
    },
    seenBy: [
      {
        type: Types.ObjectId,
        required: false,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export const Message2 = model<IMessage2, Message2Model>(
  "Message2",
  message2Schema
);
