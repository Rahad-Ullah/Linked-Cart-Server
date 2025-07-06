import { Model, Types } from "mongoose";

export type IOffer = {
    _id?: Types.ObjectId;
    name: string;
    image: string;
    status: "Active" | "Delete",
    startDate: Date;
    endDate: Date;
    discount: number;
}

export type OfferModel = Model<IOffer, Record<string, any>>;