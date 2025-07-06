import { z } from 'zod';
import { USER_ROLES } from '../../../enums/user';

export const userZodValidationSchema = z.object({
    body: z.object({

        name: z.string({
            required_error: 'Name is required',
            invalid_type_error: "Name must be a string",
        }).nonempty("Name cannot be empty"),

        email: z.string({
            required_error: 'email is required',
            invalid_type_error: "email must be a string",
        }).nonempty("email cannot be empty"),

        password: z.string({
            required_error: ' Password is required',
            invalid_type_error: " Password must be a string",
        }).nonempty("Password cannot be empty"),

        role: z.enum([ USER_ROLES.CUSTOMER, USER_ROLES.SHOPPER, USER_ROLES.SHOP], {
            required_error: 'Role is required',
            invalid_type_error: "Role must be a valid enum value",
        }),
    })
});


export const changePasswordZodValidationSchema = z.object({
    body: z.object({

        currentPassword: z.string({
            required_error: 'Current Password is required',
            invalid_type_error: "Current Password must be a string",
        }).nonempty("Current Password cannot be empty"),

        newPassword: z.string({
            required_error: 'New Password is required',
            invalid_type_error: "New Password must be a string",
        }).nonempty("New Password cannot be empty"),


        confirmPassword: z.string({
            required_error: 'Confirm Password is required',
            invalid_type_error: "Confirm Password must be a string",
        }).nonempty("Confirm Password cannot be empty")

    })
});


export const createShopperZodValidationSchema = z.object({
    body: z.object({
        name: z.string({
            required_error: 'Name is required',
            invalid_type_error: "Name must be a string",
        }).nonempty("Name cannot be empty"),
        email: z.string({
            required_error: 'email is required',
            invalid_type_error: "email must be a string",
        }).nonempty("email cannot be empty"),
        password: z.string({
            required_error: ' Password is required',
            invalid_type_error: " Password must be a string",
        }).nonempty("Password cannot be empty"),
        image:z.any({
            required_error: 'Image is required',
            invalid_type_error: "Image must be a string",
        }),
        contact: z.string({
            required_error: 'Contact is required',
            invalid_type_error: "Contact must be a string",
        }).nonempty("Contact cannot be empty")
        
    })
})