import { Model, Types } from 'mongoose';

export type IFaq = {
    _id?: Types.ObjectId;
    question: string;
    answer: string;
};
export type FaqModel = Model<IFaq>;