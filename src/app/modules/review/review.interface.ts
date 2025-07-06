import { Model, Types } from "mongoose";

export type IReview = {
    _id?: Types.ObjectId;
    customer: Types.ObjectId;
    order: Types.ObjectId;
    comment: string;
    rating: number;
    shopper?: Types.ObjectId;
    tips?: number;
}

export type ReviewModel = Model<IReview>;