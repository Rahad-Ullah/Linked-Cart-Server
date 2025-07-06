import { z } from "zod";
import { checkValidID } from "../../../shared/checkValidID";

const createCartZidValidation = z.object({
    body: z.object({
        product: z.string({
            required_error: 'Product is required'
        }),
    })
});

const decreaseCartQuantityZidValidation = z.object({
    body: z.object({
        product: z.string({
            required_error: 'Product is required'
        }),
    })
});
const increaseCartQuantityZidValidation = z.object({
    body: z.object({
        product: z.string({
            required_error: 'Product is required'
        }),
    })
});


export const CartValidation = {
    createCartZidValidation,
    decreaseCartQuantityZidValidation,
    increaseCartQuantityZidValidation
}