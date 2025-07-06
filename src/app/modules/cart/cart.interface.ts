import { Model, Types } from "mongoose";

export type ICart ={
    user: Types.ObjectId,
    shop: Types.ObjectId,
    product: Types.ObjectId,
    quantity: number,
}



export type CartModel = Model<ICart, Record<string, any>>;