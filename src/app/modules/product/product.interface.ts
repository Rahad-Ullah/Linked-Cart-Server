import { Model, Types } from "mongoose";

export type IProduct = {
    _id?: Types.ObjectId;
    shop?: Types.ObjectId;
    category: Types.ObjectId;
    image: string;
    name: string;
    price: number;
    discount?: number;
    quantity: number;
    stock: boolean;
    status: "Active" | "Delete";
    offer?: Types.ObjectId;
    productId: string;
}

export type ProductModel = Model<IProduct, Record<string, unknown>>;