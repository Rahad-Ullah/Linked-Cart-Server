import { z } from "zod";

export const bannerZodValidationSchema = z.object({
    body: z.object({
        name: z.string({
            required_error: "Name is required",
            invalid_type_error: "Name must be a string",
        }).nonempty("Name cannot be empty"),
        
        image: z.string({
            required_error: "Image is required",
            invalid_type_error: "Image must be a string",
        }).nonempty("Image cannot be empty"),
        startDate: z.string({
            required_error: "Start date is required",
            invalid_type_error: "Start date must be a string",
        }).nonempty("Start date cannot be empty"),

        endDate: z.string({
            required_error: "End date is required",
            invalid_type_error: "End date must be a string",
        }).nonempty("End date cannot be empty"),
    })
});