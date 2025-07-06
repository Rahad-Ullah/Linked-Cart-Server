import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { OrderService } from "./order.service";
import { JwtPayload } from "jsonwebtoken";
import { profile } from "winston";

const createOrder = catchAsync(async (req: Request, res: Response) => {
    const result = await OrderService.createOrderToDB(req.body);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Order created successfully",
        data: result
    })
}); 

const retrievedOrders = catchAsync(async (req: Request, res: Response) => {
    const result = await OrderService.retrievedOrdersFromDB(req.user as JwtPayload, req.query);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Seller Orders retrieved successfully",
        data: result.orders,
        pagination: result.paginationInfo
    })
}); 

const retrievedOrderDetails = catchAsync(async (req: Request, res: Response) => {
    const result = await OrderService.orderDetailsToDB(req.params.id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Order Details Retrieved successfully",
        data: result
    })
});

const retriveShopOrders = catchAsync(async (req: Request, res: Response) => {
    const result = await OrderService.retriveShopOrders(req.user as JwtPayload, req.query);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Seller Orders retrieved successfully",
        data: result.orders,
        pagination: result.paginationInfo
    })
});

const shopOrdersOverView = catchAsync(async (req: Request, res: Response) => {
    const result = await OrderService.shopOverViewFromDb(req.user as JwtPayload);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Seller Orders Overview retrieved successfully",
        data: result
    })
});

const shopOrderDetails = catchAsync(async (req: Request, res: Response) => {
    const result = await OrderService.shopOrderDetails(req.params.id,req.user as JwtPayload );
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Seller Order Details retrieved successfully",
        data: result
    })
});

const orderStatusHistory = catchAsync(async (req: Request, res: Response) => {
    const result = await OrderService.orderHistoryStatusFromDb(req.params.id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Order Status History retrieved successfully",
        data: result
    })
});

const shopOrderAnalaysis = catchAsync(async (req: Request, res: Response) => {
    const result = await OrderService.analaticsFromDBForShop(req.user as JwtPayload);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Seller Order Analysis retrieved successfully",
        data: result
    })
});

const getOrdersForShopper = catchAsync(async (req: Request, res: Response) => {
    const result = await OrderService.retriveShopOrdersForShopper(req.user as JwtPayload, req.query);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Orders retrieved successfully",
        data: result,
        
    })
});

const changeOrderStatus = catchAsync(async (req: Request, res: Response) => {
    const result = await OrderService.acceptOrderFromDb(req.params.id, req.user, req.body.status);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Order Status changed successfully",
        data: result
    })
});


const getOrdersOfDriver = catchAsync(async (req: Request, res: Response) => {
    const result = await OrderService.shoperOrdersFromDb(req.user as JwtPayload, req.query);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Orders retrieved successfully",
        data: result.data,
        pagination: result.meta

    })
});

const getSingleTaskDetails = catchAsync(async (req: Request, res: Response) => {
    const result = await OrderService.getSingleTaskDetails(req.params.id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Order Details retrieved successfully",
        data: result
    })
});

const shopperDashboardDetails = catchAsync(async (req: Request, res: Response) => {
    const result = await OrderService.shopperDashboardFromDb(req.user as JwtPayload, req.query);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Shopper Dashboard Details retrieved successfully",
        data: {
            orders: result.orders,
            wallet: result.wallet,
        },
        pagination: result.paginationInfo
    })
});

const getAllOrderForAdmin = catchAsync(async (req: Request, res: Response) => {
    const result = await OrderService.getAllOrdersFromDb(req.query);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Orders retrieved successfully",
        data: {
            orders: result.data,
            earning: result.earnings,
        },
        pagination: result.meta
    })
});

const liveSessionForShopper = catchAsync(async (req: Request, res: Response) => {
    const result = await OrderService.liveSessionForShopper(req.params.id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Live Session retrieved successfully",
        data: result
    })
});




export const OrderController = {
    createOrder,
    retrievedOrders,
    retrievedOrderDetails,
    retriveShopOrders,
    shopOrdersOverView,
    shopOrderDetails,
    orderStatusHistory,
    shopOrderAnalaysis,
    getOrdersForShopper,
    changeOrderStatus,
    getOrdersOfDriver,
    getSingleTaskDetails,
    shopperDashboardDetails,
    getAllOrderForAdmin,
    liveSessionForShopper
}