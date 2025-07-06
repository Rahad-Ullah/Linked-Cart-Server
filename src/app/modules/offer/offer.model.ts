import { model, Schema } from "mongoose";
import { IOffer, OfferModel } from "./offer.interface";

const offerSchema = new Schema<IOffer,OfferModel>({
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["Active", "Delete"],
        default: "Active",
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    discount: {
        type: Number,
        required: true,
    },
});

export const Offer = model<IOffer, OfferModel>('Offer', offerSchema);