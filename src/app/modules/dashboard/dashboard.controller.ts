import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { DashboardService } from "./dashboard.service";
import sendResponse from "../../../shared/sendResponse";

const getAdminDashboardData = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const result = await DashboardService.getAdminDashboardData(query);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Admin Dashboard Data Fetched Successfully',
      data: result
    });
});

const getAnalatycsData = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const result = await DashboardService.shopperAnalytics(query);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Shopper Analytics Data Fetched Successfully',
      data: result
    });
})

export const DashboardController = {
    getAdminDashboardData,
    getAnalatycsData
};