import { Model, Types } from "mongoose";
import { ORDER_STATUS } from "../../../enums/order";

export type IOrderHistory = {
    status: ORDER_STATUS
    date: Date;
}


export type IOrder = {
    _id?: Types.ObjectId;
    email: string;
    contact: string;
    address: string;
    notes?: string;
    user: Types.ObjectId;
    quantity: number;
    delivery_charge: number;
    price: number;
    status: ORDER_STATUS
    paymentStatus: "pending" | "paid" | "failed";
    paymentIntentId?: string;
    history?: IOrderHistory[];
    isBooked?: boolean;
    shopper?: Types.ObjectId;
    orderId?:string;
    trxId?: string;
    app_fee?: number;
};

export type IOrderItem = {
    product: Types.ObjectId;
    quantity: number;
    price: number;
    order: Types.ObjectId;
    user : Types.ObjectId;
    shop: Types.ObjectId;
    discountPrice?: number;
};

export type IOrderSession = {
    order: Types.ObjectId;
    shops:{
        name:string;
        address:string;
        latitude:number;
        longitude:number;
        shopId: Types.ObjectId;
    }[],
    dropOffAddress: {
        address: string;
        latitude: number;
        longitude: number;
    };
}


export type OrderSessionModel = Model<IOrderSession, Record<string, any>>;
export type IOrderItemModel = Model<IOrderItem, Record<string, any>>;
export type OrderModel = Model<IOrder, Record<string, any>>