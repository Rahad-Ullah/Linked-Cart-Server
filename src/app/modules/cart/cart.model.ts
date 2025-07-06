import { Schema, model } from "mongoose";
import { CartModel, ICart } from "./cart.interface";

const cartSchema = new Schema<ICart>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
       shop: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: false,
            default: 1
        },
      
    },
    {
        timestamps: true
    }
);

export const Cart = model<ICart, CartModel>('Cart', cartSchema);