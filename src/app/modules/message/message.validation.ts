import { z } from "zod";

const createMessageZodSchema = z.object({
  body: z.object({
    chatId: z.string({
      required_error: "chatId is required",
    }),
    sender: z.string({
      required_error: "sender is required",
    }),
    text: z.string().optional(),
    image: z.string().optional(),
    seenBy: z.array(z.string()).optional(),
  }),
});

const updateMessageZodSchema = z.object({
  body: z.object({
    text: z.string().optional(),
    image: z.string().optional(),
    seenBy: z.array(z.string()).optional(),
  }),
});

export const MessageValidation = {
  createMessageZodSchema,
  updateMessageZodSchema,
};
