import { z } from "zod";

const createOfferZodSchema = z.object({
    body: z.object({
        name: z.string({
            required_error: "Name is required",
            invalid_type_error: "Name must be a string"
        }).nonempty("Name must be provided"),
        image: z.any({
            required_error: "Image is required",
            invalid_type_error: "Image must be a string"
        }),
        startDate: z.string({
            required_error: "Start Date is required",
            invalid_type_error: "Start Date must be a string"
        }).nonempty("Start Date must be provided"),
        endDate: z.string({
            required_error: "End Date is required",
            invalid_type_error: "End Date must be a string"
        }).nonempty("End Date must be provided"),
        discount: z.string({
            required_error: "Discount is required",
            invalid_type_error: "Discount must be a number"
        })
        })
    })

export const OfferValidation = {
    createOfferZodSchema
}