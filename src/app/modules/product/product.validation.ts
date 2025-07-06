import { z } from "zod";
import { checkValidID } from "../../../shared/checkValidID";

export const ProductZodValidationSchema = z.object({
    body: z.object({
        category: checkValidID("Category Object ID is required"),

        image: z.string({
            required_error: "Image is Required",
            invalid_type_error: "Image must be a string",
        }).nonempty({ message: "Image cannot be empty" }),

        name: z.string({
            required_error: "Name is Required",
            invalid_type_error: "Name must be a string",
        }).nonempty({ message: "Name cannot be empty" }),

        price: z.number({
            required_error: "Price is Required",
            invalid_type_error: "Price must be a number"
        }).positive("Price cannot be negative number"),

        discount: z.number().optional(),
        quantity: z.number().optional(),
        offer: z.string().optional(),
    })
});