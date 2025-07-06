import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { AuthService } from './auth.service';

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.verifyEmailToDB(req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result.message,
        data: result.data,
    });
});


const loginUser = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.loginUserFromDB(req.body);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'User login successfully',
        data: result
    });
});

const forgetPassword = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.forgetPasswordToDB(req.body.email);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Please check your email, we send a OTP!',
        data: result
    });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
    const token = req.headers.authorization;
    const { ...resetData } = req.body;
    const result = await AuthService.resetPasswordToDB(token!, resetData);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Password reset successfully',
        data: result
    });
});


const newAccessToken = catchAsync(async (req: Request, res: Response) => {
    const { token } = req.body;
    const result = await AuthService.newAccessTokenToUser(token);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Generate Access Token successfully',
        data: result
    });
});

const resendVerificationEmail = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await AuthService.resendVerificationEmailToDB(email);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Generate OTP and send successfully',
        data: result
    });
});


export const AuthController = {
    verifyEmail,
    loginUser,
    forgetPassword,
    resetPassword,
    newAccessToken,
    resendVerificationEmail
};