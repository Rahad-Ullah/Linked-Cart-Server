import { Model, Types } from "mongoose";

export type IBanner = {
    _id?: Types.ObjectId;
    name: string;
    image: string;
    status: "Active" | "Delete",
}

export type BannerModel = Model<IBanner>;