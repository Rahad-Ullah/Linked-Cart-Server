import { Model, Types } from 'mongoose'

export type IRule = {
    _id?: Types.ObjectId;
    content: string
    type: 'privacy' | 'terms' | 'about' | "cookies" | "refund";
}

export type RuleModel = Model<IRule, Record<string, unknown>>