import { Model, Types } from "mongoose";

export type IWallet = {
    user: Types.ObjectId;
    balance: number;
    status:"active" | "inactive";

}

export type WalletModel = Model<IWallet>;