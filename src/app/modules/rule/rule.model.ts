import { model, Schema } from 'mongoose';
import { IRule, RuleModel } from './rule.interface';

const ruleSchema = new Schema<IRule, RuleModel>(
    {
        content: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['privacy', 'terms', 'about', "cookies", "refund"],
            select: 0
        }
    },
    { timestamps : true }
);

ruleSchema.index({ type: 1 }, { unique: true });

export const Rule = model<IRule, RuleModel>('Rule', ruleSchema);