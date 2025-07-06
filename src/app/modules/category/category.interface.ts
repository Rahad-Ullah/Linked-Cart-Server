import { Model, Types } from 'mongoose';

export type ICategory = {
    _id?: Types.ObjectId;
    name: string;
    image: string;
    status: "Active" | "Delete"
}

export type CategoryModel = Model<ICategory, Record<string, unknown>>