import { model, Schema } from "mongoose";
import { IWallet, WalletModel } from "./wallet.interface";

const walletSchema = new Schema<IWallet, WalletModel>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        balance: {
            type: Number,
            required: true,
            default: 0
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        }
    },
    { timestamps: true }
);

walletSchema.index({ user: 1 }, { unique: true });


export const Wallet = model<IWallet, WalletModel>("Wallet", walletSchema);