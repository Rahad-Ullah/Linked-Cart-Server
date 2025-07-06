import { z } from "zod";

const createWithdrawBalancemountZodSchema = z.object({
    body: z.object({
        amount: z.string({
            required_error: "Amount is required"
        }).refine((data) => Number(data) > 0, {
            message: "Amount must be greater than 0"
        })
    })
});

export const WalletValidation = {
    createWithdrawBalancemountZodSchema
};