import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserService } from './user.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { JwtPayload } from 'jsonwebtoken';
import { getMultipleFilesPath } from '../../../shared/getFilePath';

// register user
const createUser = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
    await UserService.createUserToDB(req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Your account has been successfully created. Verify Your Email By OTP. Check your email',
    })
});

// retrieved user profile
const getUserProfile = catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.getUserProfileFromDB(req.user as JwtPayload,);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Profile data retrieved successfully',
        data: result
    });
});

//update profile
const updateProfile = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
    const result = await UserService.updateProfileToDB(req.user as JwtPayload, req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Profile updated successfully',
        data: result
    });
});

// delete user
const deleteUser = catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.deleteUserFromDB(req.user as JwtPayload, req.body.password);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Account Deleted successfully',
        data: result
    });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
    await UserService.changePasswordToDB(req.user as JwtPayload, req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Password changed successfully',
    });
});

const shopUpdate = catchAsync(async (req: Request, res: Response) => {
    await UserService.shopUpdateToDB(req.user, req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Shop Information Updated successfully'
    });
});

const addStripeAccount = catchAsync(async(req: Request, res: Response)=>{
    const result = await UserService.addStripeAccountToDB(req.user);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Connected account created successfully",
        data: result
    })
});

const storeList = catchAsync(async(req: Request, res: Response)=>{
    const query = req.query;
    const result = await UserService.getStoresFromDB(req.user, query);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Store list retrieved successfully",
        data: result
    })
});

const getStoreDriver = catchAsync(async(req: Request, res: Response)=>{
    const result = await UserService.getStoreByIdFromDBForDriver(req.user);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Store Driver retrieved successfully",
        data: result
    })
});


const getUsersForAdmin = catchAsync(async(req: Request, res: Response)=>{
    const result = await UserService.getUsersDataForAdminFromDb(req.query);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Users retrieved successfully",
        data: result.users,
        pagination: result.pagination
    })
});

const createShopper = catchAsync(async(req: Request, res: Response)=>{
    const [nid_image,driverLicense] = getMultipleFilesPath(req.files as Express.Multer.File[],'image')||[]
    req.body.nid_image = nid_image;
    req.body.driverLicense = driverLicense;
    const result = await UserService.createShopper(req.body);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Shopper created successfully",
        data: result
    })
});

const userStatus = catchAsync(async(req: Request, res: Response)=>{
    const result = await UserService.changeUserStatus(req.params.id);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "User status updated successfully",
        data: result
    })
});

export const UserController = { 
    createUser, 
    getUserProfile, 
    updateProfile,
    deleteUser,
    changePassword,
    shopUpdate,
    addStripeAccount,
    storeList,
    getStoreDriver,
    getUsersForAdmin,
    createShopper,
    userStatus
};