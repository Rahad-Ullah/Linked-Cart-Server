import { z } from "zod";

const createChatSchema = z.object({
  body: z.object({
    participants: z.array(z.string({ message: "Participants are required" })),
  }),
});

export const chatValidation = {
  createChatSchema,
};
