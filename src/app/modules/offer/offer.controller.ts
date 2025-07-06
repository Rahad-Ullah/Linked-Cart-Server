import e, { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { OfferService } from "./offer.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { getSingleFilePath } from "../../../shared/getFilePath";

const createOffer = catchAsync(async (req: Request, res: Response) => {
    const image = getSingleFilePath(req.files, "image");
    const result = await OfferService.createOffer({ ...req.body, image });
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Offer created successfully",
        data: result
    });
});

const getAllOffer = catchAsync(async (req: Request, res: Response) => {
    const result = await OfferService.getAllOffer();
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Offer retrieved successfully",
        data: result
    });
});
const updateOffer = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const image = getSingleFilePath(req.files, "image");
    const result = await OfferService.updateOffer(id, { ...req.body, image });
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Offer updated successfully",
        data: result
    });
});
const deleteOffer = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await OfferService.deleteOffer(id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Offer deleted successfully",
        data: result
    });
});

export const OfferController = {
    createOffer,
    getAllOffer,
    updateOffer,
    deleteOffer
};