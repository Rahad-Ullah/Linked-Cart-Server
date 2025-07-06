import { z } from "zod";
import { checkValidID } from "../../../shared/checkValidID";
import { ORDER_STATUS } from "../../../enums/order";

export const orderZodValidationSchema = z.object({
    body: z.object({
        email: z.string({
            required_error: "Email is required",
            invalid_type_error: "Email must be a string"
        }).nonempty("Email must be provided").email("Invalid email address"),

        contact: z.string({
            required_error: "Contact is required",
            invalid_type_error: "Contact must be a string"
        }).nonempty("Contact must be provided"),

        address: z.string({
            required_error: "Address is required",
            invalid_type_error: "Address must be a string"
        }).nonempty("Address must be provided"),

        notes: z.string().optional(),
        delivery_charge: z.number({
            required_error: "Delivery Charge is required",
            invalid_type_error: "Delivery Charge must be a number"
        }),

    })
});

export const changeOrderStatusZodSchema = z.object({
    body: z.object({
        status: z.nativeEnum(ORDER_STATUS)
    })
});