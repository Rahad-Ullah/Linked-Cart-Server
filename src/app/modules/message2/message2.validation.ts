import { z } from "zod";

const createMessageSchema = z.object({
  body: z.object({
    chat: z.string().nonempty({ message: "Chat is required" }),
    sender: z.string().nonempty({ message: "Sender is required" }),
    text: z.string().optional(),
    image: z.string().optional(),
  }),
});

export const Message2Validations = {};
