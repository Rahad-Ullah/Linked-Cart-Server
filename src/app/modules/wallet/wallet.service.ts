import mongoose, { ObjectId, Types } from "mongoose";
import { Wallet } from "./wallet.model";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../user/user.model";
import stripe from "../../../config/stripe";

const createWalletIntoDb = async (user:ObjectId)=>{
    const existWallet = await Wallet.findOne({user: user});
    if(existWallet){
        return existWallet;
    }
    const wallet = await Wallet.create({
        user: user,
        balance: 0
    });
    return wallet;
}

const updateBalanceInWallet = async (user: Types.ObjectId, amount: number) => {
    let wallet = await Wallet.findOne({ user: user });
    if (!wallet) {
        wallet = await Wallet.create({
            user: user,
            balance: 0
        });
    }
    const amountInCent = amount;
    wallet.balance += amountInCent;
    await wallet.save();
    return wallet;
}

const getWalletBalance = async (user: JwtPayload) => {
    const wallet = await Wallet.findOne({ user: user.id });
    
    if (!wallet) {
        return await Wallet.create({
            user: user.id,
            balance: 0
        });
    }
    return wallet;
}

const withdrawBalancemount = async (user: JwtPayload, newAmount: string) => {
    const session = await mongoose.startSession();
    const transaction = await session.startTransaction();
try {
   const  amount= Number(newAmount);
    const userData = await User.findOne({ _id: user.id }).session(session);
    if (!userData){
        throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }
    if(!userData.accountInformation?.stripeAccountId){
        throw new ApiError(StatusCodes.BAD_REQUEST, "Account information not found");
    }
        const wallet = await Wallet.findOne({ user: user.id }).session(session);
    if (!wallet) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Wallet not found");
    }

    if (wallet.balance < amount) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Insufficient balance");
    }
    const transfer = await stripe.transfers.create({
        amount: amount * 100,
        currency: 'usd',
        destination: userData.accountInformation.stripeAccountId!,
    });
   await Wallet.updateOne({ user: user.id }, { $inc: { balance: -amount } }).session(session);
   await session.commitTransaction();
   session.endSession();
   return transfer;
    
} catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new ApiError(StatusCodes.BAD_REQUEST, error instanceof Error ? error.message : "Withdrawal failed");
    
}
}


export const WalletService = {
    createWalletIntoDb,
    updateBalanceInWallet,
    getWalletBalance,
    withdrawBalancemount
}