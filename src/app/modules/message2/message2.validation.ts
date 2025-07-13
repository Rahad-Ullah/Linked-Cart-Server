import { z } from "zod";

const createMessageSchema = z.object({
  body: z.object({
    chat: z.string().min(1, { message: "Chat is required" }),
    text: z.string().optional(),
    image: z.instanceof(File).optional(),
  }),
});

export const Message2Validations = { createMessageSchema };
