import { Response, Request } from "express";
import { StatusCodes } from "http-status-codes";
import { ProductService } from "./product.service";
import { JwtPayload } from "jsonwebtoken";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";

const createProduct = catchAsync(async (req: Request, res: Response)=>{
    const result = await ProductService.createProductToDB(req.body);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Product Created Successfully",
        data: result
    })
});

const updateProduct = catchAsync(async (req: Request, res: Response)=>{
    const result = await ProductService.updateProductInDB(req.params.id, req.body);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Product Updated Successfully",
        data: result
    })
});

const retrievedProducts = catchAsync(async (req: Request, res: Response)=>{
    const result = await ProductService.retrievedProductsFromDB(req.user as JwtPayload, req.query);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Product Fetched Successfully",
        data: result.products,
        pagination: result.pagination
    })
});

const retrievedShopProducts = catchAsync(async (req: Request, res: Response)=>{
    const result = await ProductService.retrievedShopProductsFromDB(req.user as JwtPayload, req.query);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Shop Product Fetched Successfully",
        data: result.products,
        pagination: result.pagination
    })
});

const deleteProduct = catchAsync(async (req: Request, res: Response)=>{
    const result = await ProductService.deleteProductFromDB(req.params.id);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Product Deleted Successfully",
        data: result
    })
});

const retrievedProductDetails = catchAsync(async (req: Request, res: Response)=>{

    const result = await ProductService.retrievedProductDetailsFromDB(req.params.id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Product Details Fetched Successfully",
        data: result
    })
});

export const ProductController = {
    createProduct,
    updateProduct,
    deleteProduct,
    retrievedProductDetails,
    retrievedProducts,
    retrievedShopProducts
}