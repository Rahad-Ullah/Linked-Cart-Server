import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { WalletService } from "./wallet.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const getWalletBalance  = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await WalletService.getWalletBalance(user);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Wallet balance fetched successfully",
        data: result
    });
});

const withdrawBalancemount  = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const amount = req.body.amount;
    const result = await WalletService.withdrawBalancemount(user, amount);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Wallet balance withdraw successfully",
        data: result
    });
});

export const WalletController = {
    getWalletBalance,
    withdrawBalancemount
}