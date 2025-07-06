import { model, Schema } from "mongoose";
import { IReview, ReviewModel } from "./review.interface";

const reviewSchema = new Schema<IReview, ReviewModel>(
    {
        customer: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        order: {
            type: Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },
        comment: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            required: true
        },
        shopper: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },
        tips: {
            type: Number,
            required: false,
        }

    },
    { timestamps: true }
);

export const Review = model<IReview, ReviewModel>("Review", reviewSchema);