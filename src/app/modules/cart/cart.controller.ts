import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { CartService } from "./cart.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const makeCart = catchAsync(async (req: Request, res: Response) => {
    const cart = await CartService.makeCartToDB(req.user, req.body);
    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Product added to cart successfully",
        data: cart
    })
});

const deleteCart = catchAsync(async (req: Request, res: Response) => {
    const cart = await CartService.deleteCartFromDB(req.user, req.params.id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Product deleted from cart successfully",
        data: cart
    })
});

const decreaseCartQuantity = catchAsync(async (req: Request, res: Response) => {
    const cart = await CartService.decreaseCartQuantityFromDB(req.user, req.body.product);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Product quantity decreased successfully",
        data: cart
    })
});

const increaseCartQuantity = catchAsync(async (req: Request, res: Response) => {
    const cart = await CartService.increaseCartQuantityFromDB(req.user, req.body.product);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Product quantity decreased successfully",
        data: cart
    })
});

const getCart = catchAsync(async (req: Request, res: Response) => {
    const cart = await CartService.getCartFromDB(req.user);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Cart fetched successfully",
        data: cart
    })
});

export const CartController = {
    makeCart,
    deleteCart,
    decreaseCartQuantity,
    getCart,
    increaseCartQuantity
}