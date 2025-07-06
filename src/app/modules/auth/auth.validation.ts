import { z } from 'zod';

const createVerifyEmailZodSchema = z.object({
    body: z.object({
        email: z.string({ required_error: 'Email is required' }),
        oneTimeCode: z.number({ required_error: 'One time code is required' })
    })
});

const createLoginZodSchema = z.object({
    body: z.object({
        email: z.string({ required_error: 'Email is required' }),
        password: z.string({ required_error: 'Password is required' }),
        deviceToken: z.string().optional(),
        latitude: z.any().optional(),
        longitude: z.any().optional(),
    })
});
  
const createForgetPasswordZodSchema = z.object({
    body: z.object({
        email: z.string({ required_error: 'Email is required' }),
    })
});
  
const createResetPasswordZodSchema = z.object({
    body: z.object({
        newPassword: z.string({ required_error: 'Password is required' }),
        confirmPassword: z.string({
            required_error: 'Confirm Password is required',
        })
    })
});

export const AuthValidation = {
    createVerifyEmailZodSchema,
    createForgetPasswordZodSchema,
    createLoginZodSchema,
    createResetPasswordZodSchema
};