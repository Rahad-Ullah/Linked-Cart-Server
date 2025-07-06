import { Schema, model } from "mongoose";
import { IOrder, IOrderHistory, IOrderItem, IOrderItemModel, IOrderSession, OrderModel, OrderSessionModel } from "./order.interface";
import { ORDER_STATUS } from "../../../enums/order";
import crypto from "crypto";
import { getRandomId } from "../../../shared/idGenerator";
const historySchema = new Schema<IOrderHistory>(
    {
        status: {
            type: String,
            enum: Object.values(ORDER_STATUS),
            default: ORDER_STATUS.PLACED,
        },
        date: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
    }
);

const orderSchema = new Schema<IOrder, OrderModel>(
    {
        email: { type: String, required: true },
        contact: { type: String, required: true },
        address: { type: String, required: true },
        notes: { type: String, required: false },
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        delivery_charge: { type: Number, required: true },
        status: {
            type: String,
            enum: Object.values(ORDER_STATUS),
            default: ORDER_STATUS.PLACED,
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending",
        },
        paymentIntentId: { type: String, required: false },
        history: { type: [historySchema],default:[
            {
                status: ORDER_STATUS.PLACED,
                date: Date.now(),
            }
        ] },
        isBooked: { type: Boolean, default: false },
        shopper: { type: Schema.Types.ObjectId, ref: "User", required: false },
        orderId: { type: String, required: false },
        trxId: { type: String, required: false },
        app_fee: { type: Number, required: false },

    },
    { timestamps: true }
);

const orderItemSchema = new Schema<IOrderItem,IOrderItemModel>({
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    shop: { type: Schema.Types.ObjectId, ref: "User", required: true },
    discountPrice: { type: Number, required: false },
},{
    timestamps: true
});


const orderSessionSchema = new Schema<IOrderSession,OrderSessionModel>({
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    shops: [{
        name: { type: String, required: true },
        address: { type: String, required: true },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        shopId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    }],
    dropOffAddress: {
        address: { type: String, required: true },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
    }
},{
    timestamps: true
});

orderSchema.pre("save", async function (next) {
    const orderId = getRandomId('ORD',6,'uppercase')
    this.orderId = orderId;
    next();
});

orderSessionSchema.index({ order: 1 }, { unique: true });

export const OrderItem = model<IOrderItem,IOrderItemModel>("OrderItem", orderItemSchema);

export const Order = model<IOrder, OrderModel>("Order", orderSchema);

export const OrderSession = model<IOrderSession,OrderSessionModel>("OrderSession", orderSessionSchema);