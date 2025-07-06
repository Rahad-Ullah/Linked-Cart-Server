import { z } from "zod"
import { checkValidID } from "../../../shared/checkValidID"

export const reviewZodValidationSchema = z.object({
    body: z.object({
        order: checkValidID("Product Object ID is required"),
        rating: z.number({ required_error: 'Rating is required' }),
        comment: z.string({ required_error: 'Comment is required' }),
    })
});