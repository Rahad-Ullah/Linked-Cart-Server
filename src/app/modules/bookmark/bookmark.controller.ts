import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { BookmarkService } from "./bookmark.service";
import { JwtPayload } from "jsonwebtoken";
import { IBookmark } from "./bookmark.interface";

const toggleBookmark = catchAsync(async (req: Request, res: Response) => {

    const payload = { user: (req.user as JwtPayload).id, product: req.body.product }
    const result = await BookmarkService.toggleBookmark(payload as IBookmark);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: result
    })
});

const getBookmark = catchAsync(async (req: Request, res: Response) => {
    const result = await BookmarkService.getBookmark(req.user as JwtPayload, req.query);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Bookmark Retrieved Successfully",
        data: result.bookmarks,
        pagination: result.pagination
    })
});


export const BookmarkController = { toggleBookmark, getBookmark }